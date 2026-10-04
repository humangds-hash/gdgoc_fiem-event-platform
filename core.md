# TinyGD Event Platform — Core Requirements & Flow

## 1. Platform Overview & Ecosystem Vision
**Ecosystem Name**: TinyGD
**Core Purpose**: A modern, high-conversion event and hackathon web platform designed specifically for tech communities (e.g., GDG, ACM, developer clubs). 

The platform serves as the central hub for any community event. It is designed to provide a frictionless experience for attendees to discover event details, RSVP seamlessly, and gain entrance via digital tickets. Simultaneously, it empowers organizers with complete dynamic control over event content, capacity management, live attendee monitoring, and on-ground check-in operations.

## 2. User Roles & Access Control
The system architecture strictly divides access and capabilities into two distinct roles:

### 2.1. Regular User / Attendee
*   **Permissions**: Public read access to event details. Authenticated access to RSVP, manage personal registration, and retrieve digital entry passes.
*   **Experience**: Focused on high-conversion, speed, and clarity.

### 2.2. Organizer / Admin
*   **Permissions**: Secure access to a dedicated administrative dashboard.
*   **Capabilities**:
    *   **Manage Everything**: The admin has complete, dynamic control over the entire platform. Every piece of public-facing information must be editable directly from the admin panel.
    *   **Event Content Management**: Add/edit/remove dates, detailed agendas, FAQs, venue information, and the "About the Event" overview.
    *   **Speaker & Organizer Profiles**: Dynamically manage speakers and organizers, including their names, bios, headshots, and essential social media links (LinkedIn, Twitter, GitHub, etc.).
    *   **Capacity Control**: Set capacity limits, manage waitlists, and monitor attendee registrations and demographics in real-time.
    *   **On-Ground Operations**: Execute participant check-ins at the venue using a built-in QR code scanner.

## 3. Attendee Flow & RSVP Registration System

### 3.1. Core Platform Objectives & Event Discovery
The main goal of the event page is to serve as a central platform where participants can easily navigate through the information and understand exactly what to expect from the event. 

Visitors landing on the platform must be able to:
*   **Learn everything** they need to know about the event at a glance.
*   **View important event details**, specifically:
    *   **About the Event**: A comprehensive overview of what the event is, goals, and target audience.
    *   **Date and Time** (Including a live countdown timer)
    *   **Venue (Location/Map)**
    *   **Detailed Agenda / Schedule**
    *   **Speakers**: Detailed profiles including their backgrounds and social media links.
    *   **Organizers / Hosts**: Information about the hosts, their roles, and their social media links.
*   **Easily navigate** through this information without friction.
*   **RSVP/Register** for the event via a prominent, sticky call-to-action button.

### 3.2. Seamless Login & Registration Flow
The login and RSVP process is designed to be frictionless, prioritizing Google Auth and an interactive modal.

1.  **The RSVP Trigger**: A prominent call-to-action button ("RSVP" / "Book Seat") is visible.
2.  **Google Sign-In**: When clicking to RSVP, the user is immediately prompted with a seamless **Google Sign-In** option. *(Note: Authentication will be strictly handled using **Supabase Google Auth**).*
3.  **The Registration Modal**: Immediately upon signing in, an interactive registration modal/popup appears containing:
    *   **Full Name**: Automatically pre-populated from the user's Google profile, but remains fully editable so users can change it if preferred.
    *   **Email Address**: Read directly from the authenticated Google account.
    *   **Attendee Category / Status**: A selector containing options tailored for tech events (e.g., Student, Working Professional / Developer, Designer / Product Specialist, Founder / Entrepreneur, Other).
    *   **Fast Registration Option**: A checkbox stating *"Create an account with these details for fast 1-click registration in future events"*. This allows frictionless event joining while offering seamless account creation for returning users.
4.  **Confirmation Action**: A primary button to confirm the RSVP and book the ticket.
5.  **Post-Registration (Digital Pass & Status)**: Upon confirmation, the user is provided with a digital entry pass (e.g., QR code). They can access a personal view to check their registration status at any time.

## 4. Design & Architecture Philosophy
*   **Modular Construction**: The codebase will be structured cleanly, separating frontend presentation, backend logic, and admin interfaces, ensuring it looks and functions as if built by a professional development team.
*   **Backend & Authentication**: The system uses **Supabase** as the primary backend-as-a-service, specifically leveraging its built-in **Google Auth** provider for seamless, secure user sign-ins, and its PostgreSQL database for robust data management.
