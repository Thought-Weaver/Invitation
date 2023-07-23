/************************************************************************
 * IMPORTS
 ***********************************************************************/

import {
    fromId,
    fromName,
    checkStatus,
    handleInteractError,
    formatTitleCase,
    createElem
} from "./utils.js";

/*************************************************************
 * CONSTANTS
 *************************************************************/

const THEME = "under-the-sea";

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
    const titleCaseName = formatTitleCase(name);

    const alreadyAttending = !!localStorage.getItem(THEME);
    if (alreadyAttending) {
        handleInteractError(Error("You're already on the RSVP list!"))
        return;
    }

    const request = { 
        method: "POST",
        body: { "comments": comments }
    };

    fetch(`invitation/rsvp/${THEME}/${titleCaseName}`, request)
        .then(checkStatus)
        .then(() => {
            localStorage.setItem(THEME, titleCaseName);
            window.location.href = "./rsvp-list.html";
        })
        .catch(error => handleInteractError(error));
}

/**
 * Get the current attendees for a given theme.
 */
export function getRSVPs() {
    fetch(`invitation/rsvps/${THEME}`)
        .then(checkStatus)
        .then(response => response.json())
        .then((response) => {
            const rsvpList = fromId("rsvp-list");
            response.names.forEach((name, index) => {
                const nameElem = createElem("p");
                nameElem.textContent = `${index + 1}. ${name}`;
                rsvpList.appendChild(nameElem);
            });

            if (response.names.length < response.maxRSVPs) {
                for (var i = response.names.length; i <= response.maxRSVPs; ++i) {
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
