import { execCommand, showPrompt, applyRippleEffect, checkMMRL, basePath, initialTransition, moduleDirectory, linkRedirect } from './util.js';
import { loadTranslations } from './language.js';

/**
 * Check if user has installed bindhosts app
 * Show QS tile option when user has not installed bindhosts app
 * Click to install bindhosts app
 * @returns {Promise<void>}
 */
async function checkBindhostsApp() {
    const tilesContainer = document.getElementById('tiles-container');
    try {
        const appInstalled = await execCommand(`pm path me.itejo443.bindhosts >/dev/null 2>&1 || echo "false"`);
        if (appInstalled.trim() === "false") {
            tilesContainer.style.display = "flex";
        }
    } catch (error) {
        console.error("Error while checking bindhosts app:", error);
    }
}

/**
 * Install the bindhosts app, called by controlPanelEventlistener
 * @returns {Promise<void>}
 */
async function installBindhostsApp (event) {
    try {
        showPrompt("control_panel.installing", true, undefined, "[+]");
        await new Promise(resolve => setTimeout(resolve, 200));
        const output = await execCommand(`sh ${moduleDirectory}/bindhosts-app.sh`);
        const lines = output.split("\n");
        lines.forEach(line => {
            if (line.includes("[+]")) {
                showPrompt("control_panel.installed", true, 5000, "[+]");
                tilesContainer.style.display = "none";
            } else if (line.includes("[x] Failed to download")) {
                showPrompt("control_panel.download_fail", false, undefined, "[×]");
            } else if (line.includes("[*]")) {
                showPrompt("control_panel.install_fail", false, 5000, "[×]");
            }
        });
    } catch (error) {
        console.error("Execution failed:", error);
    }
}

/**
 * Check module update status
 * Event listener for module update toggle
 * @returns {Promise<void>}
 */
async function checkUpdateStatus() {
    const toggleVersion = document.getElementById('toggle-version');
    try {
        const result = await execCommand(`grep -q '^updateJson' ${moduleDirectory}/module.prop`);
        toggleVersion.checked = true;
    } catch (error) {
        toggleVersion.checked = false;
        console.error('Error checking update status:', error);
    }
}

/**
 * Switch module update status and refresh toggle, called by controlPanelEventlistener
 * @returns {Promise<void>}
 */
async function toggleModuleUpdate(event) {
    try {
        const result = await execCommand(`sh ${moduleDirectory}/bindhosts.sh --toggle-updatejson`);
        const lines = result.split("\n");
        lines.forEach(line => {
            if (line.includes("[+]")) {
                showPrompt("control_panel.update_true", true, undefined, "[+]");
            } else if (line.includes("[x]")) {
                showPrompt("control_panel.update_false", false, undefined, "[×]");
            }
        });
        checkUpdateStatus();
    } catch (error) {
        console.error("Failed to toggle update", error);
    }
}

const actionRedirectStatus = document.getElementById('action-redirect');
/**
 * Display action redirect switch when running in Magisk
 * Action redirect WebUI toggle
 * @returns {Promise<void>}
 */
async function checkMagisk() {
    try {
        const magiskEnv = await execCommand(`command -v magisk >/dev/null 2>&1 && echo "true" || echo "false"`);
        if (magiskEnv.trim() === "true") {
            document.getElementById('action-redirect-container').style.display = "flex";
            await checkRedirectStatus();
        }
    } catch (error) {
        console.error("Error while checking magisk", error);
    }
}

/**
 * Toggle the action redirect WebUI setting, called by controlPanelEventlistener
 * @returns {Promise<void>}
 */
async function toggleActionRedirectWebui(event) {
    try {
        await execCommand(`sed -i "s/^magisk_webui_redirect=.*/magisk_webui_redirect=${actionRedirectStatus.checked ? 0 : 1}/" ${basePath}/webui_setting.sh`);
        if (actionRedirectStatus.checked) {
            showPrompt("control_panel.action_prompt_false", false, undefined, "[×]");
        } else {
            showPrompt("control_panel.action_prompt_true", true, undefined, "[+]");
        }
        await checkRedirectStatus();
    } catch (error) {
        console.error("Failed to execute change status", error);
    }
}

/**
 * Check action redirect status
 * @returns {Promise<void>}
 */
async function checkRedirectStatus() {
    try {
        const result = await execCommand(`[ ! -f ${basePath}/webui_setting.sh ] || grep -q '^magisk_webui_redirect=1' ${basePath}/webui_setting.sh`);
        actionRedirectStatus.checked = true;
    } catch (error) {
        actionRedirectStatus.checked = false;
        console.error('Error checking action redirect status:', error);
    }
}

const cronToggle = document.getElementById('toggle-cron');
/**
 * Check cron status
 * Event listener for cron toggle
 * @returns {Promise<void>}
 */
async function checkCronStatus() {
    try {
        const result = await execCommand(`grep -q "bindhosts.sh" ${basePath}/crontabs/root`);
        cronToggle.checked = true;
    } catch (error) {
        cronToggle.checked = false;
        console.error('Error checking cron status:', error);
    }
}

/**
 * Toggle cron job status, called by controlPanelEventlistener
 * @returns {Promise<void>}
 */
async function toggleCron(event) {
    try {
        const result = await execCommand(`sh ${moduleDirectory}/bindhosts.sh --${cronToggle.checked ? "disable" : "enable"}-cron`);
        const lines = result.split("\n");
        lines.forEach(line => {
            if (line.includes("[+]")) {
                showPrompt("control_panel.cron_true", true, undefined, "[+]");
            } else if (line.includes("[x]")) {
                showPrompt("control_panel.cron_false", false, undefined, "[×]");
            }
        });
        checkCronStatus();
    } catch (error) {
        console.error("Failed to toggle cron", error);
    }
}

/**
 * Open language menu overlay, called by controlPanelEventlistener
 * @returns {void}
 */
function openLanguageMenu() {
    const languageOverlay = document.getElementById('language-overlay');
    languageOverlay.style.display = 'flex';
    setTimeout(() => {
        languageOverlay.style.opacity = '1';
    }, 10);

    const closeOverlay = () => {
        languageOverlay.style.opacity = '0';
        setTimeout(() => {
            languageOverlay.style.display = 'none';
        }, 200);
    };

    let languageMenuListener = false;
    if (!languageMenuListener) {
        document.querySelector('.close-btn').addEventListener('click', closeOverlay);
        languageOverlay.addEventListener('click', (event) => {
            if (event.target === languageOverlay) closeOverlay();
        });
        languageMenuListener = true;
    }
}

/**
 * Attach event listeners to control panel items
 * @returns {void}
 */
function controlPanelEventlistener(event) {
    const controlPanel = {
        "language-container": openLanguageMenu,
        "tiles-container": installBindhostsApp,
        "update-toggle-container": toggleModuleUpdate,
        "action-redirect-container": toggleActionRedirectWebui,
        "cron-toggle-container": toggleCron,
        "github-issues": () => linkRedirect('https://github.com/bindhosts/bindhosts/issues/new')
    };

    Object.entries(controlPanel).forEach(([element, functionName]) => {
        const el = document.getElementById(element);
        if (el) {
            let touchMoved = false;
            el.addEventListener('touchstart', () => touchMoved = false);
            el.addEventListener('touchmove', () => touchMoved = true);
            el.addEventListener('touchend', () => {
                if (!touchMoved) setTimeout(() => functionName(event), 10);
            });
        }
    });
}

/**
 * Initial load event listener
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', async () => {
    checkMMRL();
    initialTransition();
    loadTranslations();
    checkUpdateStatus();
    checkBindhostsApp();
    checkMagisk();
    checkCronStatus();
    controlPanelEventlistener();
    applyRippleEffect();
});