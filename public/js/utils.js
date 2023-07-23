/************************************************************************
 * CONSTANTS
 ***********************************************************************/

export const fromId = document.getElementById.bind(document);
export const fromName = document.getElementsByName.bind(document);
export const fromTag = document.getElementsByTagName.bind(document);
export const createElem = document.createElement.bind(document); 

/************************************************************************
 * FUNCTIONS
 ***********************************************************************/

/**
 * Takes a space-separated string and converts it to a title case string.
 * 
 * @param {String} s - The dash-separated string.
 * @returns {String} The string formatted in title case.
 */
 export function formatTitleCase(s) {
    let words = s.split(" ");
    let firstWord = words[0];
    let result = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
    for (let i = 1; i < words.length; i++) {
        let nextWord = words[i];
        result += nextWord.charAt(0).toUpperCase() + nextWord.slice(1);
    }
    return result;
}

/**
 * Checks the status of the response for an error. In the case of an error,
 * throws an error to interrupt the fetch sequence.
 *
 * @param {Response} response - The response from the API call.
 * @return {object} Valid response if it was successful, else rejected Promise result.
 */
export function checkStatus(response) {
    if (!response?.ok) {
        throw new Error(response.statusMessage);
    }
    return response;
}

/**
 * Handles any errors that occur with RSVPing.
 *
 * @param {Error} error - The error raised during the process.
 */
export function handleInteractError(error) {
    const errorContainer = fromId("error-container");
    const errorString = fromId("error-string");

    errorContainer.classList.remove("hidden");
    errorString.textContent = `Error: ${error.message}`;
}
