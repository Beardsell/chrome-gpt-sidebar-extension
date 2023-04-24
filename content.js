// Add a global variable to store the current state of visual changes
let visualChangesEnabled = true;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "toggleSidebar") {
        toggleSidebar();
    } else if (request.message === "toggleVisualChanges") {
        toggleVisualChanges();
    }
});

function toggleSidebar() {
    const navElement = document.querySelector("nav");

    if (navElement) {
        const sidebar = navElement.parentNode.parentNode.parentNode;
        if (sidebar) {
            sidebar.classList.toggle("md:flex");
            sidebar.classList.toggle("md:w-[260px]");
            sidebar.classList.toggle("md:flex-col");
        }
    }
}

function editElementClasses(element) {
    // Remove the old classes
    element.classList.remove("md:max-w-2xl", "lg:max-w-xl", "xl:max-w-3xl");

    // Add the new classes
    element.classList.add("md:w-11/12", "lg:w-11/12", "xl:w-11/12");
}

const elementClassList = [
    "text-base",
    "gap-4",
    "md:gap-6",
    "md:max-w-2xl",
    "lg:max-w-xl",
    "xl:max-w-3xl",
    "p-4",
    "md:py-6",
    "flex",
    "lg:px-0",
    "m-auto",
];

const classSelector = elementClassList
    .map((className) => "." + className.replace(":", "\\:"))
    .join("");

function onPageLoad() {
    // Edit classes for existing elements on page load
    document.querySelectorAll(classSelector).forEach((element) => {
        editElementClasses(element);
    });

    // Set up the MutationObserver to watch for new elements
    const targetNode = document.body;

    const observerConfig = {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false,
    };

    const observerCallback = (mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.matches(classSelector)) {
                            editElementClasses(node);
                        }

                        node.querySelectorAll(classSelector).forEach((element) => {
                            editElementClasses(element);
                        });
                    }
                });
            }
        }
    };

    const observer = new MutationObserver(observerCallback);
    observer.observe(targetNode, observerConfig);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onPageLoad);
} else {
    onPageLoad();
}

function toggleVisualChanges() {
    visualChangesEnabled = !visualChangesEnabled;

    if (visualChangesEnabled) {
        // Apply the visual changes
        document.querySelectorAll(classSelector).forEach((element) => {
            editElementClasses(element);
        });
    } else {
        // Revert the visual changes
        document
            .querySelectorAll(".md\\:w-11\\/12.lg\\:w-11\\/12.xl\\:w-11\\/12")
            .forEach((element) => {
                element.classList.add("md:max-w-2xl", "lg:max-w-xl", "xl:max-w-3xl");
                element.classList.remove("md:w-11/12", "lg:w-11/12", "xl:w-11/12");
            });
    }
}
