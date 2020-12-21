Instagram Mate
=======================

Jump to [What's new?](https://github.com/pihomeserver/instamate/blob/master/CHANGELOG.md)

A powerful, self-hosted data logger for your **Instagram** account

* Written with NodeJS to collect data
* Data is stored in a Postgres database
* Visualization and data analysis with Grafana

### Features

The current application collects data and insights of an Instagram Business account.

Current information stored in the databased are :
- User profile
  - Biography
  - Profile picture
  - Insights (every 15 minutes):
    - media
    - followers
    - follows
  - Detailed insights (once a day)
    - Click on e-mail link if exists
    - Click on website link if exists
    - Impressions of the profile
    - Click on phone number if exists
    - Profile views
    - Profiles reach
    - New followers gain
- Published media
  - Publication date
  - Caption
  - Comments count
  - Likes count
  - Engagement total
  - Impressions count
  - Profiles reached by the publication
  - Saved count
  - Media type
  - Media screenshot
- Published stories
  - Screenshot of the published story
  - Publication date
  - Caption
  - Exits count
  - Impressions count
  - Reached profiles count
  - Replies (even if wrong due to EU GDPR)
  - Taps forward count
  - Taps backward count

**Dashboards**

All of these data can be reused in Grafana to create monitoring dashboards
![Example 1](https://github.com/pihomeserver/instamate/tree/main/public/screenshots/screen1.png)
![Example 2](https://github.com/pihomeserver/instamate/tree/main/public/screenshots/screen2.png)
![Example 3](https://github.com/pihomeserver/instamate/tree/main/public/screenshots/screen3.png)

License
-------

Copyright (c) 2020 Pi Home Server

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify copies of the Software (selling is not authorized), and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
