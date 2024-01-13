import browser, { Alarms } from "webextension-polyfill"

export enum Alarm {
    /** Alert for periodic check on chapter updates */
    CheckChaptersUpdates = "checkChaptersUpdates",

    /** Alert for periodic check on mirror updates and new AMR updates */
    CheckMirrorsUpdates = "checkMirrorsUpdates",

    /** Stop spinning icon if enabled **/
    StopSpinning = "stopSpinning",

    /**
     * Alarm when we should remove the lock on chapter update
     * This is used in case the chapter update crashed in got stuck in the running
     * mode preventing any further updates from happening
     */
    UpdatingChapterListsChange = "stopChapterUpdate"
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
 * Time when the alarm is scheduled to first fire, in milliseconds past the epoch. Optional.
 */
export function clearAlarm(name: Alarm) {
    return browser.alarms.clear(name)
}
