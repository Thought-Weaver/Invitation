/************************************************************************
 * IMPORTS
 ***********************************************************************/

import {
    fromId,
    fromName,
    checkStatus,
    handleInteractError,
    createElem
} from "./utils.js";

/*************************************************************
 * CONSTANTS
 *************************************************************/

const THEME = "under_the_sea";

/*************************************************************
 * FUNCTIONS
 *************************************************************/

/**
 * Submit your RSVP to the party.
 */
export function submitRSVP() {
    const name = fromName("name")[0].value;
    if (!name) {
        handleInteractError(Error("Your name can't be blank."))
        return;
    }

    const comments = fromName("comments")[0].value;
    const formattedName = name.replaceAll(" ", "_");

    const alreadyAttending = !!localStorage.getItem(THEME);
    if (alreadyAttending) {
        handleInteractError(Error("You're already on the RSVP list!"))
        return;
    }

    const request = { 
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            "comments": comments
        })
    };

    fetch(`https://loganservers.com:3000/rsvp/${THEME}/${formattedName}`, request)
        .then(checkStatus)
        .then(() => {
            localStorage.setItem(THEME, formattedName);
            window.location.href = "./rsvp-list.html";
        })
        .catch(error => handleInteractError(error));
}

/**
 * Get the current attendees for a given theme.
 */
export function getRSVPs() {
    const request = { 
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
    };

    fetch(`https://loganservers.com:3000/rsvps/${THEME}`, request)
        .then(checkStatus)
        .then(response => response.json())
        .then((response) => {
            const rsvpList = fromId("rsvp-list");
            response.names.forEach((name, index) => {
                const formattedName = name.replaceAll("_", " ");
                const nameElem = createElem("p");
                nameElem.textContent = `${index + 1}. ${formattedName}`;
                rsvpList.appendChild(nameElem);
            });

            if (response.names.length < response.maxRSVPs) {
                for (var i = response.names.length; i < response.maxRSVPs; ++i) {
                    const blankElem = createElem("p");
                    blankElem.textContent = `${i + 1}. _____________________`;
                    rsvpList.appendChild(blankElem);
                }
            }
        })
        .catch(error => handleInteractError(error));
}

/************************************************************************
 * EVENT LISTENERS
 ***********************************************************************/

fromId("form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    submitRSVP();
});
