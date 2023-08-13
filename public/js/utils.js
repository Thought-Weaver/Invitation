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
