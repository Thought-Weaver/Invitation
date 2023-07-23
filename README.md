# Invitation

A simple invitation system I made for easily coordinating people coming to my themed dinner parties.

# Overview

To avoid race conditions, the user is presented with a single textbox alongside the theme styling and effects. If the party isn't full, they'll be added to the list; before they join, they can see the list of people who are going to attend, otherwise they'll receive an error message.

There is also a secondary textbox under entering your name to indicate food allergies and preferences; this will not be public to permit people privacy, but I can view it in the JSON and make adjustments to the menu as necessary.

On successfully RSVPing, the page will redirect to the RSVP list where you can delete your name (validated using localstorage).
