import browser, { Alarms } from "webextension-polyfill"

/** These are not expected to be ever cleared. **/
export enum PeriodAlarms {
    /** Alert for periodic check on chapter updates */
    CheckChaptersUpdates = "checkChaptersUpdates",

    /** Alert for periodic check on mirror updates and new AMR updates */
    CheckMirrorsUpdates = "checkMirrorsUpdates"
}

export enum Alarm {
    /** Stop spinning icon if enabled **/
    StopSpinning = "stopSpinning",

    /**
     * Alarm when we should remove the lock on chapter update
     * This is used in case the chapter update crashed in got stuck in the running
     * mode preventing any further updates from happening
     */
    UpdatingChapterListsChange = "stopChapterUpdate",

    /** Same as CheckChaptersUpdates, however we can create/override multiple as well as be cleared **/
    DelayedChaptersUpdates = "delayedChaptersUpdates"
}

type AlarmCreate = { name: Alarm } & Required<
    Pick<Alarms.CreateAlarmInfoType, "when"> | Pick<Alarms.CreateAlarmInfoType, "delayInMinutes">
>

/**
 * Details about the alarm.
 * The alarm first fires either at 'when' milliseconds past the epoch (if 'when' is provided),
 * after 'delayInMinutes' minutes from the current time (if 'delayInMinutes' is provided instead),
 * or after 'periodInMinutes' minutes from the current time (if only 'periodInMinutes' is provided). Users should never provide both 'when' and 'delayInMinutes'.
 *
 * If 'periodInMinutes' is provided, then the alarm recurs repeatedly after that many minutes.
 */
export function createAlarm(setup: AlarmCreate) {
    const alarmInfo: Alarms.CreateAlarmInfoType =
        "when" in setup ? { when: setup.when } : { delayInMinutes: setup.delayInMinutes }

    browser.alarms.create(setup.name, alarmInfo)
}

/**
 * Clear Alarm with given name.
 *
 * Note that name should be unique to avoid collision with default period based alarms.
 */
export function clearAlarm(name: Alarm) {
    return browser.alarms.clear(name)
}
