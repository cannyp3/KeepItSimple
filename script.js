document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const MIN_QUERY_LENGTH = 3;

    // DOM Elements
    const searchBar = document.getElementById('search-bar');
    const relatedComponents = document.getElementById('related-components');
    const starterComponents = document.getElementById('starter-components');

    // --- App Initialization ---
    let components = {};
    let componentAliases = {};
    let reverseComponentAliases = {};
    let defaultPinned = [];
    let pinnedComponents = new Set();
    let isSearchActive = false;

    async function initializeApp() {
        try {
            const response = await fetch('components.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            components = data.components;
            componentAliases = data.aliases;
            defaultPinned = data.defaultPinned;
            reverseComponentAliases = Object.fromEntries(Object.entries(componentAliases).map(([key, value]) => [value, key]));

            initializePinnedState();
            render();
            updateURL();

            // Activate UI elements now that data is loaded
            searchBar.disabled = false;
            searchBar.placeholder = "Search for components...";
            searchBar.addEventListener('input', render);
            document.addEventListener('click', handlePinClick);

        } catch (error) {
            console.error("Could not load component data:", error);
            // Display an error message to the user
            document.body.innerHTML = '<p style="color: red;">Error: Could not load page components. Please try again later.</p>';
        }
    }

    function initializePinnedState() {
        const urlPinned = getPinnedFromURL();
        if (urlPinned !== null) {
            pinnedComponents = urlPinned;
        } else {
            const fromStorage = localStorage.getItem('pinnedComponents');
            pinnedComponents = new Set(fromStorage ? JSON.parse(fromStorage) : defaultPinned);
        }
    }

    // --- Pinned State Management ---

    function getPinnedFromURL() {
        const params = new URLSearchParams(window.location.search);
        const pinnedAliases = params.get('pinned');
        if (pinnedAliases !== null) {
            const componentNames = pinnedAliases ? pinnedAliases.split(',').map(alias => reverseComponentAliases[alias]).filter(Boolean) : [];
            return new Set(componentNames);
        }
        return null;
    }

    function updateURL() {
        const pinnedAliases = Array.from(pinnedComponents).map(name => componentAliases[name]).filter(Boolean);
        if (pinnedAliases.length > 0) {
            const newUrl = `${window.location.pathname}?pinned=${pinnedAliases.join(',')}`;
            history.replaceState({ pinned: Array.from(pinnedComponents) }, '', newUrl);
        } else {
            const newUrl = `${window.location.pathname}?pinned=`;
            history.replaceState({ pinned: [] }, '', newUrl);
        }
    }

    // --- Rendering ---

    function createComponentHTML(componentName, innerContent, isPinned) {
        const pinIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <title>Pin</title>
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M9 4v6l-2 4v2h10v-2l-2 -4v-6"></path>
                <line x1="12" y1="16" x2="12" y2="21"></line>
                <line x1="8" y1="4" x2="16" y2="4"></line>
            </svg>`;

        const unpinIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="currentColor" stroke-linecap="round" stroke-linejoin="round">
                <title>Unpin</title>
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M9 4v6l-2 4v2h10v-2l-2 -4v-6z"></path>
                <line x1="12" y1="16" x2="12" y2="21"></line>
                <line x1="8" y1="4" x2="16" y2="4"></line>
            </svg>`;

        const buttonIcon = isPinned ? unpinIcon : pinIcon;
        const buttonClass = isPinned ? 'unpin-button' : 'pin-button';
        const buttonAriaLabel = isPinned ? 'Unpin' : 'Pin';

        return `
            <div class="card" data-component-name="${componentName}">
                <div class="card-header">
                    <h2>${componentName}</h2>
                    <button class="${buttonClass}" data-component="${componentName}" aria-label="${buttonAriaLabel}">
                        ${buttonIcon}
                    </button>
                </div>
                ${innerContent}
            </div>
        `;
    }

    function render() {
        starterComponents.innerHTML = '';
        relatedComponents.innerHTML = '';

        pinnedComponents.forEach(componentName => {
            if (components[componentName]) {
                const componentHTML = createComponentHTML(componentName, components[componentName].content, true);
                starterComponents.innerHTML += componentHTML;
            }
        });

        const query = searchBar.value.toLowerCase();
        const queryIsLongEnough = query.length >= MIN_QUERY_LENGTH;

        if (queryIsLongEnough) {
            let relatedHTML = '';
            for (const [name, data] of Object.entries(components)) {
                if (name.toLowerCase().includes(query) && !pinnedComponents.has(name)) {
                    relatedHTML += createComponentHTML(name, data.content, false);
                }
            }
            relatedComponents.innerHTML = relatedHTML;

            // Scroll to results only when search begins and there are results
            if (!isSearchActive && relatedHTML) {
                document.getElementById('related-components').scrollIntoView({ behavior: 'smooth' });
            }
        }
        
        isSearchActive = queryIsLongEnough;
    }

    // --- Event Handlers ---

    function handlePinClick(e) {
        const button = e.target.closest('.pin-button, .unpin-button');
        if (!button) return;

        const componentName = button.dataset.component;

        if (pinnedComponents.has(componentName)) {
            pinnedComponents.delete(componentName);
        } else {
            pinnedComponents.add(componentName);
        }

        localStorage.setItem('pinnedComponents', JSON.stringify(Array.from(pinnedComponents)));
        updateURL();
        render();
    }

    // --- Start the App ---
    initializeApp();
});