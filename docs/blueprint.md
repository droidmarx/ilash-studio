# **App Name**: Agenda Recriada

## Core Features:

- Client Retrieval: Fetches client data from the specified Mock API and displays it in the agenda.
- Calendar Display: Renders a calendar with the current month, highlighting the current day and days with events.
- Event Modal: Displays event details in a modal when a day with events is clicked.
- Appointment List: Shows a list of upcoming appointments with visual highlights.
- Theme Toggle: Allows users to toggle between light and dark themes, persisting the setting in localStorage.
- WhatsApp Integration: Includes a floating WhatsApp button that links to a pre-filled message to a given number.
- Data Persistence: Implements POST, PUT, and DELETE requests to the Mock API to synchronize the remote data store.

## Style Guidelines:

- Primary color: Dark purple (#4B0082) to give the app a sense of modern elegance.
- Background color: Very light gray (#F0F0F0), almost white.
- Accent color: Blue (#007BFF) to complement the primary color.
- Headline font: 'Great Vibes', a cursive serif, giving a more human feel. Note: currently only Google Fonts are supported.
- Body font: 'Poppins', a sans-serif geometric typeface providing an easy-to-read structure. Note: currently only Google Fonts are supported.
- Use Bootstrap Icons and Font Awesome for a consistent icon set.
- Responsive layout using Bootstrap's grid system for various screen sizes.
- Subtle animations on theme toggle and when displaying the event modal, enhancing user experience.