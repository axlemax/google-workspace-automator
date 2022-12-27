import {
	type GmailLabel
,
	type GmailLocation,
	type Mark,
	type HasType,
	type Category,
	type Status
} from '../types/Gmail';
import { type Date, type Time } from '../types/dateAndTime';

const add0 = (number: number) => (number > 9 ? `${number}` : `0${number}`);

// Same order as https://support.google.com/mail/answer/7190?hl=en

export default class Query {
	private query: string;

	private readonly threads: GoogleAppsScript.Gmail.GmailThread[];

	public constructor(startQuery: string = '') {
		this.query = startQuery;
		this.threads = [];
	}

	public readonly toString = () => this.query;

	/**
	 * Specify the sender
	 */
	public readonly from = (strings: string[]) => {
		this.query += ` from:(${strings.join(' ')})`;
		return this;
	};

	/**
	 * Specify a recipient
	 */
	public readonly to = (strings: string[]) => {
		this.query += ` to:(${strings.join(' ')})`;
		return this;
	};

	/**
	 * Specify a recipient who received a copy
	 */
	public readonly cc = (strings: string[]) => {
		this.query += ` cc:(${strings.join(' ')})`;
		return this;
	};

	/**
	 * Specify a recipient who received a copy
	 */
	public readonly bcc = (strings: string[]) => {
		this.query += ` bcc:(${strings.join(' ')})`;
		return this;
	};

	/**
	 * Words in the subject line
	 */
	public readonly subject = (strings: string[]) => {
		this.query += ` subject:(${strings.join(' ')})`;
		return this;
	};

	/**
	 * Messages that match multiple terms
	 */
	public readonly OR = (...strings: string[]) => {
		this.query += ` {${strings.join(' ')}}`;
		return this;
	};

	/**
	 * Remove messages from your results
	 */
	public readonly NOT = (...strings: string[]) => {
		this.query += ` -${strings.join(' -')})`;
		return this;
	};

	/**
	 * Find messages with words near each other. Use the number to say how many words apart the words can
	 * be.
	 * Add quotes to find messages in which the word you put first stays first.
	 */
	public readonly around = (...strings: string[]) => {
		this.query += ` ${strings.join(' AROUND ')}`;
		return this;
	};

	/**
	 * Messages that have a certain label
	 *
	 * @param label label(s) to use in the query
	 */
	public readonly label = (label: GmailLabel | GmailLabel[]) => {
		const labels = Array.isArray(label) ? label : [label];
		this.query += ` label:(${labels.join(' ')})`;
		return this;
	};

	/**
	 * Messages that have a certain label
	 *
	 * @param type type(s) to use in the query
	 */
	public readonly has = (type: HasType | HasType[]) => {
		const types = Array.isArray(type) ? type : [type];
		this.query += types.map((typeValue) => ` has:${typeValue}`);
		return this;
	};

	/**
	 * Helper method for stars
	 *
	 * @param mark type(s) of mark / star to use in the query
	 */
	public readonly hasMark = (mark: Mark | Mark[]) => this.has(mark);

	/**
	 * Messages from a mailing list
	 *
	 * @param list list to use in the query
	 */
	public readonly mailingList = (list: string) => {
		this.query += ` list:${list}`;
		return this;
	};

	/**
	 * Attachments with a certain name or file type
	 *
	 * @param filename name of file to query for
	 */
	public readonly fileName = (filename: string) => {
		this.query += ` filename:${filename}`;
		return this;
	};

	/**
	 * Messages in any folder, including Spam and Trash
	 *
	 * @param location location(s) to use in query, may also be a label
	 */
	public readonly in = (location: GmailLocation | GmailLocation[]) => {
		const locations = Array.isArray(location) ? location : [location];
		this.query += ` in:(${locations.join(' ')}`;
		return this;
	};

	/**
	 * Starred, snoozed, unread, or read messages
	 *
	 * @param status status to query for
	 */
	public readonly is = (status: Status) => {
		this.query += ` is:${status}`;
		return this;
	};

	/**
	 * Not starred, snoozed, unread, or read messages
	 *
	 * @param status status to filter threads by (i.e. threads that are not this status will be
	 * returned)
	 */
	public readonly isNot = (status: Status) => {
		this.query += `NOT is:${status}`;
		return this;
	};

	/**
	 * Search for messages sent during a certain time period
	 */
	public readonly after = ({ year, month, day }: Date) => {
		this.query += ` ${year}/${add0(month)}/${add0(day)}`;
		return this;
	};

	/**
	 * Search for messages sent during a certain time period
	 */
	public readonly before = ({ year, month, day }: Date) => {
		this.query += ` ${year}/${add0(month)}/${add0(day)}`;
		return this;
	};

	/**
	 * Search for messages older or newer than a time period
	 */
	public readonly olderThan = (amount: number, interval: Time) => {
		this.query += ` older_than:${amount}${interval.charAt(0)}`;
		return this;
	};

	/**
	 * Search for messages older or newer than a time period
	 */
	public readonly newerThan = (number: number, interval: Time) => {
		this.query += ` newer_than:${number}${interval.charAt(0)}`;
		return this;
	};

	/**
	 * Messages in a certain category
	 */
	public readonly category = (cat: Category) => {
		this.query += ` category:${cat}`;
		return this;
	};

	/**
	 * Messages larger than a certain size in bytes
	 */
	public readonly size = (largerThanInBytes: number) => {
		this.query = ` size:${largerThanInBytes}`;
		return this;
	};

	/**
	 * Messages larger than a certain size in bytes
	 *
	 * @example largerThan("10M"), largerThan(1000000)
	 */
	public readonly larger = (largerThanInBytes: number | `${number}M`) => {
		this.query = ` larger:${largerThanInBytes}`;
		return this;
	};

	/**
	 * Messages smaller than a certain size in bytes
	 *
	 * @example smallerThan("10M"), smallerThan(1000000)
	 */
	public readonly smaller = (smallerThanInBytes: number | `${number}M`) => {
		this.query = ` smaller:${smallerThanInBytes}`;
		return this;
	};

	/**
	 * Messages with a certain message-id header
	 */
	public readonly Rfc822msgid = (...headers: string[]) => {
		this.query += headers.map((header) => ` rfc822msgid:${header}`);
		return this;
	};

	/**
	 * Messages that have a label
	 */
	public readonly hasLabels = () => {
		this.query += ' has:userlabels';
		return this;
	};

	/**
	 * Messages that don't have a label
	 */
	public readonly hasNoLabels = () => {
		this.query += ' has:nouserlabels';
		return this;
	};

	/**
	 * Executes the query and returns the resulting threads.
	 *
	 * @returns the result of the query so far
	 */
	public readonly execute = () => {
		this.threads.push(...GmailApp.search(this.query));
		return this.threads;
	};

	/**
	 * Resets the query. The threads that have so far matched are kept.
	 */
	public readonly newQuery = () => {
		this.query = '';
	};
}

// TODO add function to page through query results
