# Changelog

All notable changes to this project will be documented in this file.

This file is designed to be parsed by [changelog-parser](https://www.npmjs.com/package/changelog-parser).
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The following sections are the standard sections to use, please stick with them for consistency

-   New Features
-   Changed Features
-   Removed Features
-   Bug Fixes
-   New Mirrors
-   Mirror Fixes
-   Disabled Mirrors
-   Notes - This is the catchall for anything that does not fit in the other sections.

## [3.0.3] - 2024-08-25

### Bug Fixes

-   Fixed an issue with search bar having a white background when in dark mode

### Mirror Fixes

-   Reset Scans - New domain
-   Manga Reader - Disabled non english chapters from getting picked up for now because it breaks the chapter list
-   Asura Comics - A bunch of changes to site design and url scheme
-   Luminous Scans - New domain
-   Read Comic Online - Fix for image loading (Credit @Jay)
-   Reaper Scans - New website, looks like this might actually work now o.o
-   Fan Comics - New domain
-   Night Scans - New domain

### New Mirrors

-   UToon - https://utoon.net/
-   Drake Comic - https://drakecomic.com/
-   Cypher Scans - https://cypherscans.xyz/

### New Features

-   I have added an experimental way to support novels by faking images to Reaper Scans. This is a test to see if I can do this without rewriting many parts of the extension to support text. This is best used in webtoon mode and I may look into ways to force it for these. For anyone interested try it out and give me feedback on discord as I fine tune this.

### Notes

-   I have finally gotten around to working on the website. Currently I just copy/pasted the orignal website but I plan on working on it more later to change it. I adjusted the links in amr for my server
-   I created a patreon and adjusted the links, I put this off for a long time but decided to end up doing it after all. My commitment to mainting this stays the same no matter the result of this as I use this extension extensively myself so keeping it maintained is also for my own use

## [3.0.2] - 2024-07-12

### New Features

-   Added a simple server and mirror for testing various different errors on so we can control when they happen and work on notifications/fixes for common problems

### Changed Features

-   I have re-enabled the error icons for series that have errors, and started added some different error messages in to identify the issue. More error codes will follow

### Mirror Fixes

-   Manga Galaxy - Fixed issue with single digit chapters
-   Reset Scans - New domain
-   Flame Scans - New domain
-   Nice Oppai - Changed language to Thai instead of english
-   FM Team - Change language to French instead of english
-   Manga Freak - Changed domains, possible issue with cloudflare
-   Read Comic Online - Changed image encryption and fix for alternative image source (Credit @jaygitsby)
-   Manga Hasu - New domain
-   Surya Toon - Extra chapter being picked up
-   Many Toon - Changed image source
-   Manhwa Freak - New domain. The old one still works but they will be shutting it down so migration to the new site is advised
-   Read Comic Online - Fixed an issue recognizing chapter pages
-   HyperDex - New domain

### New Mirrors

-   Fire Scans - https://firescans.xyz/

## Disabled Mirrors

-   Toonily.Net
-   Leveler Scans
-   Manga 1st - Warnings from both uBlock and antivirus software about this site, will not bypass to check if it is still active and I advise no one to read from it
-   Manga Dods
-   Manga Lab - Warning about expired security certificate
-   Read Manhua
-   Alpha Scans - Warning from vpn about security certificate validation
-   Cosmic Scans - The website says they are closed

## [3.0.1] - 2024-05-26

### Mirror Fixes

-   Toonily.com - Fixed image loading

### New_Mirrors

-   Manga Park - https://mangapark.net
-   Manga Reader.to - https://mangareader.to/home
-   Fan Comics - https://www.mgeko.com
-   Manga BTT - https://manhwabtt.com
-   Manga Budddy - https://mangabuddy.com/home

## [3.0.0] - 2024-05-19

### Notes

-   The extension has been rewritten to be compatible with manifest V3, this was a major overhaul that has been going on for a while. Unfortunately that means getting a complete changelog is going to be near impossible but I will try to get as many as I can included in this

### New Features

-   A log for gist sync errors has been added

### Removed Features

-   Removed error marking for fetching series list, will enable when bugs are worked out

### New Mirrors

-   Like Manga - https://likemanga.io
-   Surya Toon - https://suryatoon.com
-   Dark Scan - https://dark-scan.com/
-   Creepy Scans - https://creepyscans.com/
-   Hari Manga - https://harimanga.com
-   Manga Galaxy - https://mangagalaxy.me
-   SeiManga - https://seimanga.me
-   Reaper Scans (Fake) - https://reaper-scans.com
-   Animated Glitched Comics - https://agscomics.com

### Mirror Fixes

-   Asura - Domain changed
-   Scylla Scans - Changed website
-   Immortal Updates - Domain changed
-   Manga Clash - Domain changed
-   Top Manhua - Domain changed
-   Luminous Scans - Domain changed
-   Rizz Comics - Domain changed
-   Manhwa Freak - Domain changed
-   Immortal Updates - Domain changed
-   Manga Clash - Domain changed
-   Top Manhua - Domain changed
-   Void Scans - Domain changed
-   Reset Scans - Domain changed
-   Zero Scans - Domain changed
-   Manga Hub - Api added for fetching images
-   Mint Manga - Fix getting chapter urls
-   Read M - Domain changed
-   Disaster Scans - Domain changed
-   Night Scans - Domain changed
-   Manga Fox - Random image failure fixes
