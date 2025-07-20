<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400"></a></p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We've already laid the foundation — freeing you to create without sweating the small things.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs/10.x) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains over 1500 video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/10.x/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

<hr/>
<p align="center"><a href="https://coreui.io/" target="_blank"><img src="https://coreui.io/bootstrap/docs/2.1/assets/brand/logo.svg" width="400"></a></p>

## About CoreUI

CoreUI is the fastest way to build a modern dashboard for any platforms, browser, or device. A complete UI Kit that allows you to quickly build eye-catching, high-quality, high-performance responsive applications.

## Quick start

Looking to quickly add CoreUI for Bootstrap to your project? Use jsDelivr, a free open source CDN. Using a package manager or need to download the source files? <a href="https://coreui.io/bootstrap/docs/getting-started/download/"target="_blank">Head to the downloads page.</a>

CoreUI was created as an extension to Bootstrap, allowing it to be used both as a standalone library and as a replacement for the currently utilized Bootstrap in your project.

<hr/>
<p align="center"><a href="https://vitejs.dev" target="_blank"><img src="https://vitejs.dev/logo-with-shadow.png" width="200"></a>
<a href="https://react.dev" target="_blank"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="200"></a>
</p>

## About ReactJs

React is a free and open-source front-end JavaScript library for building user interfaces based on components by Facebook Inc. It is maintained by Meta (formerly Facebook) and a community of individual developers and companies.

## About Vite

Next Generation Frontend Tooling
Get ready for a development environment that can finally catch up with you.

<hr/>

## PathCast

Smart Navigation Meets Intelligent Advertising

## Project Overview

PathCast is an intelligent wayfinding and location-based advertising platform that simplifies navigation through complex environments while delivering targeted, real-time promotions. Using advanced geolocation, user behavior insights, and contextual delivery, PathCast enhances both user experience and business engagement.

## Core Features

Dynamic Wayfinding
Real-time indoor and outdoor navigation using GPS, BLE, and map integration to guide users effortlessly through any environment.

Smart Advertising
Location-aware, behavior-driven ads and promotions delivered to mobile apps or on-site digital screens at the perfect moment.

Personalized Recommendations
Tailored suggestions based on individual user preferences, behavior history, and navigation patterns.

Analytics Dashboard
For venue managers and advertisers: gain insights via heatmaps, ad engagement metrics, dwell times, and user flows.

Interactive Kiosks & Mobile App Integration
Seamless, touch-friendly interfaces and mobile support for enhanced user interaction and experience.

## Target Use Cases

Transportation Hubs: Airports, train & bus stations

Retail Spaces: Shopping malls, outlet centers

Educational & Healthcare Campuses: Universities, hospitals

Cultural & Public Venues: Museums, stadiums, convention centers

Tourism & Entertainment: Theme parks, landmarks, and visitor centers

## Brand Overview

PathCast is a smart wayfinding and contextual advertising platform designed to help users confidently navigate large, complex spaces while engaging them with relevant, real-time messaging tailored to their journey.

## Tagline Ideas

Functional Style

"Guiding your way. Powering what's next."

"Navigate smarter. Advertise better."

"Wayfinding meets real-time reach."

Catchy & Creative

"Cast the path. Catch the moment."

"Where direction meets connection."

"Your route. Your relevance."

Let us know if you'd prefer a tone that's more technical, playful, or elegant!

## Mission Statement

To simplify navigation in complex environments while empowering businesses to deliver hyper-relevant, real-time messaging that enhances both user experience and engagement.

## Vision Statement

To become the leading platform for intelligent wayfinding and contextual advertising — making every step smarter, every message matter, and every space more connected.

## Brand Personality

| Trait           | Description                                                           |
| --------------- | --------------------------------------------------------------------- |
| **Smart**       | Leverages seamless technology to enhance every interaction            |
| **Helpful**     | Focused on guiding users efficiently and intuitively                  |
| **Contextual**  | Delivers timely and relevant value based on location and behavior     |
| **Modern**      | Clean, user-centric design that reflects current tech standards       |
| **Trustworthy** | Secure, dependable, and respectful of user privacy and data integrity |

## Get Involved / Contact

Interested in partnership, integration, or early access?
📧 Email us at: bautistael23@gmail.com

# Promoter Management Module

## Overview
The Promoter Management module allows administrators to manage promoters, their schedules, and handle exceptions using a manual override system. This module supports full CRUD operations, advanced date-based scheduling, and manual assignment of promoters for specific days.

## Features
- Create, edit, and delete promoters
- Schedule promoters for specific dates
- Manual override to force a promoter assignment for a particular day
- Bulk actions and soft delete/restore
- Integrated with the admin panel frontend

## Database Structure
- **promoters**: Stores promoter information (name, description, status, etc.)
- **promoter_schedules**: Stores schedule entries for each promoter (promoter_id, date, is_manual, timestamps)

## Manual Override Explained
Manual Override allows an admin to explicitly assign a promoter for a specific date, regardless of the existing schedule. This is useful for last-minute changes, special events, or exceptions.

- When adding a schedule, check the "Manual Override" box to mark it as a manual assignment.
- Only one manual override is allowed per date; adding a new manual override for the same date will replace the previous one.
- Manual overrides take precedence over regular schedules for that date.

## Backend Usage
- **CRUD Endpoints**: `/promoter-management/promoters` (GET, POST, PUT, DELETE)
- **Schedule Endpoint**: `/promoter-management/promoters/schedule` (POST)
- **Manual Override Endpoint**: `/promoter-management/promoters/manual-update` (POST)
- **Bulk/Archived Routes**: For bulk delete, restore, force delete, and archived listing

## Frontend Usage
- **Promoters List**: View all promoters, their status, and scheduled dates (manual overrides are labeled)
- **Promoter Form**: Create/edit promoters, add schedule dates, and set manual overrides
- **Bulk Actions**: Delete, restore, and force delete multiple promoters

## Example Workflow
1. Admin creates a promoter and schedules them for several dates.
2. On a specific day, a different promoter needs to be assigned. Admin uses the form to add a schedule for that date and checks "Manual Override".
3. The system ensures that the manual override is used for that date, regardless of the regular schedule.

## Notes
- Manual overrides are highlighted in the UI for clarity.
- Only one manual override per date is allowed; the latest one replaces any previous override for that date.

---
For more details, see the code in `app/Models/Promoter.php`, `app/Models/PromoterSchedule.php`, and the corresponding frontend pages in `admin-panel/src/pages/promoter-management/`.
