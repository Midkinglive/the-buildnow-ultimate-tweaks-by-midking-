// ==UserScript==
// @name         BuildNow GG – Fullscreen FPS + Crosshair + Keybinds (SAFE)
// @namespace    buildnowgg.fullscreen.safe
// @version      1.2.0
// @description  Guaranteed fullscreen FPS counter, custom crosshair, keybinds, performance tweaks
// @match        https://www.crazygames.com/game/buildnow-gg
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const ROOT = document.documentElement;

    /* ================= PERFORMANCE ================= */

    try {
        Object.defineProperty(window, 'devicePixelRatio', { get: () => 1 });
    } catch {}

    const perfStyle = document.createElement('style');
    perfStyle.textContent = `
        * { animation: none !important; transition: none !important; }
        canvas { image-rendering: optimizeSpeed !important; }
    `;
    ROOT.appendChild(perfStyle);

    /* ================= FPS COUNTER ================= */

    let fpsEnabled = true;

    const fpsBox = document.createElement('div');
    fpsBox.id = 'bn-fps';
    fpsBox.style.cssText = `
        position: fixed;
        top: 8px;
        left: 8px;
        z-index: 2147483647;
        background: rgba(0,0,0,0.6);
        color: #00ff90;
        font-family: monospace;
        font-size: 14px;
        padding: 4px 8px;
        border-radius: 6px;
        pointer-events: none;
        user-select: none;
    `;
    fpsBox.textContent = 'FPS: --';

    function attachFPS() {
        if (!fpsBox.isConnected) ROOT.appendChild(fpsBox);
        fpsBox.style.display = fpsEnabled ? 'block' : 'none';
    }

    attachFPS();

    let frames = 0;
    let last = performance.now();

    function fpsLoop(t) {
        if (fpsEnabled) {
            frames++;
            if (t - last >= 1000) {
                fpsBox.textContent = `FPS: ${frames}`;
                frames = 0;
                last = t;
            }
        }
        requestAnimationFrame(fpsLoop);
    }
    requestAnimationFrame(fpsLoop);

    /* ================= CUSTOM CROSSHAIR ================= */

    let crosshairEnabled = true;
    let size = 10;
    let thickness = 2;
    let colorIndex = 0;

    const colors = ['#ffffff', '#00ff90', '#ff4040', '#00aaff', '#ffff00'];

    const crosshair = document.createElement('div');
    crosshair.id = 'bn-crosshair';
    crosshair.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2147483646;
        pointer-events: none;
    `;

    const v = document.createElement('div');
    const h = document.createElement('div');
    crosshair.append(v, h);

    function updateCrosshair() {
        v.style.cssText = `
            position:absolute;
            width:${thickness}px;
            height:${size}px;
            left:50%;
            top:0;
            transform:translateX(-50%);
            background:${colors[colorIndex]};
        `;
        h.style.cssText = `
            position:absolute;
            height:${thickness}px;
            width:${size}px;
            top:50%;
            left:0;
            transform:translateY(-50%);
            background:${colors[colorIndex]};
        `;
        crosshair.style.display = crosshairEnabled ? 'block' : 'none';
    }

    function attachCrosshair() {
        if (!crosshair.isConnected) ROOT.appendChild(crosshair);
        updateCrosshair();
    }

    attachCrosshair();

    /* ================= FULLSCREEN + POINTER LOCK FIX ================= */

    function reattachOverlays() {
        attachFPS();
        attachCrosshair();
    }

    document.addEventListener('fullscreenchange', reattachOverlays);
    document.addEventListener('pointerlockchange', reattachOverlays);
    window.addEventListener('resize', reattachOverlays);

    /* ================= KEYBINDS ================= */

    document.addEventListener('keydown', (e) => {
        if (e.repeat) return;

        switch (e.key.toLowerCase()) {
            case 'c': // crosshair toggle
                crosshairEnabled = !crosshairEnabled;
                updateCrosshair();
                break;

            case 'f': // fps toggle
                fpsEnabled = !fpsEnabled;
                attachFPS();
                break;

            case '+':
            case '=':
                size = Math.min(size + 2, 30);
                updateCrosshair();
                break;

            case '-':
                size = Math.max(size - 2, 4);
                updateCrosshair();
                break;

            case ']':
                thickness = Math.min(thickness + 1, 6);
                updateCrosshair();
                break;

            case '[':
                thickness = Math.max(thickness - 1, 1);
                updateCrosshair();
                break;

            case 'h':
                colorIndex = (colorIndex + 1) % colors.length;
                updateCrosshair();
                break;

            case 'r': // reset
                size = 10;
                thickness = 2;
                colorIndex = 0;
                crosshairEnabled = true;
                fpsEnabled = true;
                reattachOverlays();
                break;
        }
    });

    /* ================= INPUT CLEANUP ================= */

    window.addEventListener('contextmenu', e => e.preventDefault(), { passive: false });

})();
