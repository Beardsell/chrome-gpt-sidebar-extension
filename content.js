const visualChangesEnabledKey = "visualChangesEnabled";
const defaultVisualChangesEnabled = true;

chrome.storage.sync.get([visualChangesEnabledKey], (result) => {
    const visualChangesEnabled = result.hasOwnProperty(visualChangesEnabledKey)
        ? result[visualChangesEnabledKey]
        : defaultVisualChangesEnabled;

    onPageLoad(visualChangesEnabled);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "toggleSidebar") {
        toggleSidebar();
    } else if (request.message === "toggleVisualChanges") {
        toggleVisualChanges();
    }
});

function toggleSidebar() {
    const navElement = document.querySelector("nav");

    if (!navElement) {
        console.error("Nav element not found. Unable to toggle sidebar.");
        return;
    }

    const sidebar = navElement.parentNode.parentNode.parentNode;
    if (!sidebar) {
        console.error("Sidebar not found. Unable to toggle sidebar.");
        return;
    }

    sidebar.classList.toggle("md:flex");
    sidebar.classList.toggle("md:w-[260px]");
    sidebar.classList.toggle("md:flex-col");
}

function editElementClasses(element, addClasses) {
    const oldClasses = ["md:max-w-2xl", "lg:max-w-xl", "xl:max-w-3xl"];
    const newClasses = ["md:w-11/12", "lg:w-11/12", "xl:w-11/12"];

    if (addClasses) {
        element.classList.remove(...oldClasses);
        element.classList.add(...newClasses);
    } else {
        element.classList.remove(...newClasses);
        element.classList.add(...oldClasses);
    }
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
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

function onPageLoad(visualChangesEnabled) {
    applyVisualChanges(document, visualChangesEnabled);

    const targetNode = document.body;
    const observerConfig = {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false,
    };

    const observerCallback = debounce((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        applyVisualChanges(node, visualChangesEnabled);
                    }
                });
            }
        }
    }, 100);

    const observer = new MutationObserver(observerCallback);
    observer.observe(targetNode, observerConfig);
}

function applyVisualChanges(node, visualChangesEnabled) {
    if (node.matches(createClassSelector(elementClassList))) {
        editElementClasses(node, visualChangesEnabled);
    }
    node.querySelectorAll(createClassSelector(elementClassList)).forEach((element) => {
        editElementClasses(element, visualChangesEnabled);
    });
}

function createClassSelector(classList) {
    return classList
      .map((className) => "." + className.replace(":", "\\:").replace("/", "\\/"))
      .join(", ");
}

function applyVisualChanges(visualChangesEnabled) {
    const oldClassesSelector = createClassSelector(["md:max-w-2xl", "lg:max-w-xl", "xl:max-w-3xl"]);
    const newClassesSelector = createClassSelector(["md:w-11/12", "lg:w-11/12", "xl:w-11/12"]);

    document.querySelectorAll(`${oldClassesSelector}, ${newClassesSelector}`).forEach((element) => {
        editElementClasses(element, visualChangesEnabled);
    });
}

function applyVisualChangesToNode(node, visualChangesEnabled) {
    if (node.matches(classSelector)) {
        editElementClasses(node, visualChangesEnabled);
    }

    node.querySelectorAll(classSelector).forEach((element) => {
        editElementClasses(element, visualChangesEnabled);
    });
}

function toggleVisualChanges() {
    chrome.storage.sync.get([visualChangesEnabledKey], (result) => {
        const visualChangesEnabled = result.hasOwnProperty(visualChangesEnabledKey)
            ? result[visualChangesEnabledKey]
            : defaultVisualChangesEnabled;

        const newVisualChangesEnabled = !visualChangesEnabled;

        // Save the new visual changes state
        chrome.storage.sync.set({ [visualChangesEnabledKey]: newVisualChangesEnabled }, () => {
            console.log("Visual changes state updated:", newVisualChangesEnabled);
        });

        // Apply or revert the visual changes based on the new state
        applyVisualChanges(newVisualChangesEnabled);
    });
}
