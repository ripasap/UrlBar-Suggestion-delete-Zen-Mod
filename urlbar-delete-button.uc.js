// ==UserScript==
// @name           Urlbar Delete Suggestions Button (Diagnostic)
// @description    Add a delete button to URL bar history entries
// @include        main
// ==/UserScript==

console.log("ZEN MOD: Started");

(function () {

    function initZenMod() {

        const resultsContainer =
            document.getElementById("urlbar-results") ||
            document.querySelector(".urlbarView-results") ||
            document.querySelector(".urlbarView");

        if (!resultsContainer) {
            console.error("Could not find URL bar results container");
            return;
        }

        const observer = new MutationObserver(() => {

            const rows = document.querySelectorAll(
                '.urlbarView-row:not([has-delete-btn="true"])'
            );

            rows.forEach(row => {

                row.setAttribute("has-delete-btn", "true");

                // console.log("ROW:", row);
                // console.log("ROW KEYS:", Object.keys(row));

                const result =
                    row.result ||
                    row._result ||
                    (gURLBar.view?.getResultFromElement
                        ? gURLBar.view.getResultFromElement(row)
                        : null);

                // console.log("FOUND RESULT:", result);

                if (!result) {
                    console.warn("No result object found");
                    return;
                }

                if (result.heuristic) {
                    return;
                }

                const deleteBtn = document.createElement("div");

                deleteBtn.className = "custom-urlbar-delete-btn";
                deleteBtn.innerHTML = '×';

                deleteBtn.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    width: 24px;
                    height: 24px;

                    margin-left: auto;
                    margin-right: 8px;

                    color: #a0a0a0;
                    background: transparent;
                    border: none;

                    font-size: 16px;
                    line-height: 1;
                    cursor: pointer;
                `;

                deleteBtn.addEventListener("mouseenter", () => {
                    deleteBtn.style.color = "#ff4a4a";
                });

                deleteBtn.addEventListener("mouseleave", () => {
                    deleteBtn.style.color = "#a0a0a0";
                });

                deleteBtn.addEventListener("mousedown", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                });

                deleteBtn.addEventListener("click", async (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();

                    try {
                        await PlacesUtils.history.remove(result.payload.url);

                        row.remove();

                        console.log("Deleted:", result.payload.url);
                    } catch (e) {
                        console.error(e);
                    }

                    return false;
                }, true);

                const innerRow =
                    row.querySelector(".urlbarView-row-inner") || row;

                const actionArea =
                    row.querySelector(".urlbarView-button-menu") ||
                    row.querySelector(".urlbarView-row-inner");

                if (actionArea) {
                    actionArea.parentNode.insertBefore(deleteBtn, actionArea);
                } else {
                    innerRow.appendChild(deleteBtn);
                }
            });

        });

        observer.observe(resultsContainer, {
            childList: true,
            subtree: true
        });

        console.log("Observer attached");
    }

    if (gBrowserInit.delayedStartupFinished) {
        initZenMod();
    } else {
        Services.obs.addObserver(function obs(subject, topic) {
            Services.obs.removeObserver(obs, topic);
            initZenMod();
        }, "browser-delayed-startup-finished");
    }

})();