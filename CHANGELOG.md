# Changelog
---------

### 0.0.19 (April 14, 2021)
- Node backend
  - Cron configuration with environment variables allowing dynamic modification without updating the backend container

### 0.0.18 (April 9, 2021)
- Node backend
  - Reels cron managing 429 errors (too many requests)
  - Reels cron configuration with environment variables

### 0.0.17 (April 8, 2021)
- Grafana
  - Upgrade to Grafana 7.3.10
  - Disable anonymous authentication

### 0.0.16 (March 23, 2021)
- Node backend
  - Bug fix in the user statistics updates

### 0.0.15 (March 16, 2021)
- Grafana
  - Bug fixing of dashboards

### 0.0.14 (March 9, 2021)
- Grafana
  - Update time range for few dashboard
  - Correct some timerange issues
  - Add support for Reels insights
- Node backend
  - Split of insight file (now based on the insight type)
  - Reels insights support

### 0.0.13 (February 12, 2021)
- Grafana
  - Bug fixing of dashboards

### 0.0.12 (February 9, 2021)
- Grafana
  - Bug fixing of dashboards

### 0.0.11 (February 1, 2021)
- Grafana
  - Bug fixing of dashboards

### 0.0.10 (January 23, 2021)
- Grafana
  - Bug fixing of dashboards
  - Add a new dashboard to compare 2 media evolution

### 0.0.9 (January 21, 2021)
- Grafana
  - Bug fixing of dashboards
  - Update of dashboards
  - Add new dashboard to follow audience evolution (countries, locales and gender)
- Node backend
  - Add online_followers metric

### 0.0.8 (January 18, 2021)
- Grafana
  - Bug fixing of dashboards
- Node backend
  - Add audience_city, audience_gender_age, audience_locale metric

### 0.0.7 (January 14, 2021)
- Grafana
  - Bug fixing of dashboards
  - Update of dashboards
  - Add world map plugin
- Node backend
  - Add new model for lifetime insights
  - Add cron task (every 8 hours) to retrieve lifetime insights
  - Add audience_country metric
- Git
  - Update of README

### 0.0.6 (January 06, 2021)
- Documentation
  - Add information about calculation of engagement rates
- Node backend
  - Update Dockerfile to use environment variable for the port exposed

### 0.0.5 (January 06, 2021)
- Documentation
  - Add documentation
- Grafana
  - Bug fixing on dashboards
  - Create Dockerfile
  - Create files for automatic provisionning of the docker image
- Node backend
  - Update of the Dockerfile to support arm64 container

### 0.0.4 (January 05, 2021)
- Grafana
  - Bug fixing
  - Create a dashboard dedicated to followers, follows and media evolution
- Postgresql database
  - Correction of the user model
- Node backend
  - Correction of error handling in the database connection
  - Update of the Dockerfile

### 0.0.3 (December 28, 2020)
- Documentation
  - Create draft for documentation
- Grafana
  - Update some dashboards
- Node backend
  - Update dependencies
  - Update Dockerfile

### 0.0.2 (December 27, 2020)
- Grafana
  - Update some dashboards

### 0.0.1 (December 27, 2020)
- Postgresql database
  - Update of models. Change some data types to improve storage
- Node backend
  - Review of some promises
  - Cleaning of some useless packages
- Grafana
  - Add Grafana dashboards for Instamate
  - Add script to backup or restore Grafana dashboards

### 0.0.0 (December 20, 2020)
- Initial release
