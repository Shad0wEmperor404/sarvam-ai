/* ═══════════════════════════════════════════════════════════════
   Heritage Storytelling Agent — Frontend Application
   ═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ──────────────────────────────────────────────────────────
       STATE
       ────────────────────────────────────────────────────────── */
    const state = {
        currentTab: 'transcribe',
        uploadedFile: null,
        transcriptionResult: '',
        translationResult: '',
        storyResult: null,
        storyFormat: 'interactive_story',
        storyRawText: '',
        isPodcastContent: false,
        languages: [],
        voices: [],
    };

    /* ──────────────────────────────────────────────────────────
       DOM REFERENCES
       ────────────────────────────────────────────────────────── */
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const dom = {
        // Tabs
        tabBtns:            $$('.tab-btn'),
        tabPanels:          $$('.tab-panel'),
        // Theme
        themeToggle:        $('#theme-toggle'),
        // Loading
        loadingOverlay:     $('#loading-overlay'),
        // Transcribe
        dropzone:           $('#dropzone'),
        fileInput:          $('#file-input'),
        filePreview:        $('#file-preview'),
        previewImage:       $('#preview-image'),
        previewImageWrap:   $('#preview-image-container'),
        previewAudioWrap:   $('#preview-audio-container'),
        previewFilename:    $('#preview-filename'),
        previewFilesize:    $('#preview-filesize'),
        removeFileBtn:      $('#remove-file'),
        transcribeLang:     $('#transcribe-lang'),
        btnTranscribe:      $('#btn-transcribe'),
        transcribeResults:  $('#transcribe-results'),
        transcriptionText:  $('#transcription-text'),
        btnCopyTranscription: $('#btn-copy-transcription'),
        btnSendToTranslate: $('#btn-send-to-translate'),
        btnSendToTransform: $('#btn-send-to-transform'),
        // Translate
        sourceLang:         $('#source-lang'),
        targetLang:         $('#target-lang'),
        sourceText:         $('#source-text'),
        translatedText:     $('#translated-text'),
        translateContext:   $('#translate-context'),
        btnTranslate:       $('#btn-translate'),
        btnSwapLangs:       $('#btn-swap-langs'),
        btnCopyTranslation: $('#btn-copy-translation'),
        btnTranslatedToTransform: $('#btn-translated-to-transform'),
        // Transform
        storyInput:         $('#story-input'),
        formatCards:        $$('.format-card'),
        storyStyle:         $('#story-style'),
        storyLang:          $('#story-lang'),
        btnGenerateStory:   $('#btn-generate-story'),
        storyResults:       $('#story-results'),
        storyResultTitle:   $('#story-result-title'),
        storyContent:       $('#story-content'),
        btnCopyStory:       $('#btn-copy-story'),
        btnSendToNarrate:   $('#btn-send-to-narrate'),
        // Narrate
        narrateText:        $('#narrate-text'),
        voiceSelect:        $('#voice-select'),
        voiceDescription:   $('#voice-description'),
        narrateStyle:       $('#narrate-style'),
        btnNarrate:         $('#btn-narrate'),
        btnNarratePodcast:  $('#btn-narrate-podcast'),
        narrateResults:     $('#narrate-results'),
        narrationAudio:     $('#narration-audio'),
        btnDownloadAudio:   $('#btn-download-audio'),
        // API Key & Provider Modal
        btnApiKey:          $('#btn-api-key'),
        apiKeyDialog:       $('#api-key-dialog'),
        btnCloseKeyDialog:  $('#btn-close-key-dialog'),
        inputApiKey:        $('#input-api-key'),
        btnSaveKey:         $('#btn-save-key'),
        btnClearKey:        $('#btn-clear-key'),
        btnToggleKeyVis:    $('#btn-toggle-key-visibility'),
        keyHealthIndicator: $('#key-health-indicator'),
        apiKeyStatusText:   $('#api-key-status-text'),
        // Samples Showcases
        sampleChipsTranscribe: $('#sample-chips-transcribe'),
        sampleChipsTranslate:  $('#sample-chips-translate'),
        sampleChipsTransform:  $('#sample-chips-transform'),
    };

    /* ──────────────────────────────────────────────────────────
       INITIALISATION
       ────────────────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        initTheme();
        initApiKeyModal();
        initTabs();
        initDropzone();
        initTranscribe();
        initTranslate();
        initTransform();
        initNarrate();
        fetchLanguages();
        fetchVoices();
        fetchSamples();
        checkBackendHealth();
        restoreState();
    }

    /* ──────────────────────────────────────────────────────────
       THEME
       ────────────────────────────────────────────────────────── */
    function initTheme() {
        const saved = localStorage.getItem('hsa-theme');
        if (saved) document.documentElement.setAttribute('data-theme', saved);
        updateThemeIcon();

        dom.themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('hsa-theme', next);
            updateThemeIcon();
        });
    }

    function updateThemeIcon() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        dom.themeToggle.innerHTML = isDark
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    }

    /* ──────────────────────────────────────────────────────────
       API KEY MODAL & BACKEND HEALTH (SARVAM AI)
       ────────────────────────────────────────────────────────── */
    function initApiKeyModal() {
        if (!dom.btnApiKey || !dom.apiKeyDialog) return;

        // Restore key from localStorage
        const localKey = localStorage.getItem('hsa-sarvam-key') || '';
        if (dom.inputApiKey) dom.inputApiKey.value = localKey;

        dom.btnApiKey.addEventListener('click', () => {
            dom.apiKeyDialog.showModal();
            checkBackendHealth();
        });

        if (dom.btnCloseKeyDialog) {
            dom.btnCloseKeyDialog.addEventListener('click', () => {
                dom.apiKeyDialog.close();
            });
        }

        // Close on backdrop click
        dom.apiKeyDialog.addEventListener('click', (e) => {
            if (e.target === dom.apiKeyDialog) dom.apiKeyDialog.close();
        });

        if (dom.btnToggleKeyVis) {
            dom.btnToggleKeyVis.addEventListener('click', () => {
                const isPassword = dom.inputApiKey.type === 'password';
                dom.inputApiKey.type = isPassword ? 'text' : 'password';
                dom.btnToggleKeyVis.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
            });
        }

        if (dom.btnSaveKey) {
            dom.btnSaveKey.addEventListener('click', () => {
                const val = dom.inputApiKey.value.trim();
                if (val) {
                    localStorage.setItem('hsa-sarvam-key', val);
                    showToast('Sarvam API Key saved in browser!', 'success');
                } else {
                    localStorage.removeItem('hsa-sarvam-key');
                    showToast('Sarvam API Key removed.', 'info');
                }
                checkBackendHealth();
                dom.apiKeyDialog.close();
            });
        }

        if (dom.btnClearKey) {
            dom.btnClearKey.addEventListener('click', () => {
                dom.inputApiKey.value = '';
                localStorage.removeItem('hsa-sarvam-key');
                showToast('Sarvam API Key cleared.', 'info');
                checkBackendHealth();
            });
        }
    }

    async function checkBackendHealth() {
        try {
            const res = await fetch('/api/health');
            if (!res.ok) return;
            const data = await res.json();
            const isConfigured = data.api_key_configured || Boolean(localStorage.getItem('hsa-sarvam-key'));
            const models = data.models || {};

            let statusHtml = '';
            if (isConfigured) {
                statusHtml = `
                    <div style="color: #16a34a; font-weight: 600; margin-bottom: 0.4rem;">
                        <i class="fas fa-check-circle"></i> Sarvam AI Platform Connected
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">
                        &bull; Speech-to-Text: <strong>${escapeHtml(models.speech_to_text || 'saaras:v4')}</strong><br>
                        &bull; Translation: <strong>${escapeHtml(models.translation || 'mayura:v1')}</strong><br>
                        &bull; Voice Narration: <strong>${escapeHtml(models.text_to_speech || 'bulbul:v4-flash')}</strong><br>
                        &bull; Story Engine: <strong>${escapeHtml(models.story_generation || 'sarvam-105b')}</strong>
                    </div>
                `;
            } else {
                statusHtml = `
                    <div style="color: #d97706;">
                        <i class="fas fa-exclamation-triangle"></i> Configure your Sarvam AI API subscription key (sk_...) to get started.
                    </div>
                `;
            }

            if (dom.keyHealthIndicator) {
                dom.keyHealthIndicator.innerHTML = statusHtml;
                dom.keyHealthIndicator.className = isConfigured ? 'key-status-badge active' : 'key-status-badge missing';
            }

            if (dom.apiKeyStatusText) {
                dom.apiKeyStatusText.textContent = isConfigured ? 'Sarvam AI Active' : 'Configure Key';
                dom.btnApiKey.classList.toggle('configured', isConfigured);
            }
        } catch (e) {
            console.warn('Health check error:', e);
        }
    }

    /* ──────────────────────────────────────────────────────────
       SAMPLE HERITAGE ARCHIVES
       ────────────────────────────────────────────────────────── */
    async function fetchSamples() {
        try {
            const res = await fetch('/api/samples');
            if (!res.ok) return;
            const data = await res.json();
            const samples = data.samples || [];
            renderSampleChips(samples);
        } catch (e) {
            console.warn('Could not load samples:', e);
        }
    }

    function renderSampleChips(samples) {
        const targets = [
            { el: dom.sampleChipsTranscribe, tab: 'transcribe' },
            { el: dom.sampleChipsTranslate,  tab: 'translate' },
            { el: dom.sampleChipsTransform,  tab: 'transform' }
        ];

        targets.forEach(({ el, tab }) => {
            if (!el) return;
            el.innerHTML = '';
            samples.forEach((sample) => {
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'sample-chip';
                chip.innerHTML = `<i class="fas fa-feather"></i> <span>${escapeHtml(sample.title)}</span>`;
                chip.title = `${sample.category} — ${sample.context}`;
                chip.addEventListener('click', () => loadSample(sample, tab));
                el.appendChild(chip);
            });
        });
    }

    function loadSample(sample, activeTab) {
        if (activeTab === 'transcribe') {
            state.transcriptionResult = sample.text;
            dom.transcriptionText.textContent = sample.text;
            dom.transcribeResults.classList.remove('hidden');
            dom.transcribeLang.value = sample.language || '';
            showToast(`Loaded sample: ${sample.title}`, 'info');
            dom.transcribeResults.scrollIntoView({ behavior: 'smooth' });
        } else if (activeTab === 'translate') {
            dom.sourceText.value = sample.text;
            dom.translateContext.value = sample.context || '';
            showToast(`Loaded into Translate: ${sample.title}`, 'info');
            dom.sourceText.focus();
        } else if (activeTab === 'transform') {
            dom.storyInput.value = `${sample.title}\n\n${sample.context}\n\n${sample.text}`;
            showToast(`Loaded into Story Transform: ${sample.title}`, 'info');
            dom.storyInput.focus();
        }
    }

    /* ──────────────────────────────────────────────────────────
       API FETCH WRAPPER (SARVAM AI AUTH)
       ────────────────────────────────────────────────────────── */
    function apiFetch(url, options = {}) {
        options = options || {};
        options.headers = options.headers || {};
        const savedKey = localStorage.getItem('hsa-sarvam-key');
        if (savedKey) {
            if (options.headers instanceof Headers) {
                options.headers.set('api-subscription-key', savedKey);
            } else {
                options.headers['api-subscription-key'] = savedKey;
            }
        }
        return fetch(url, options);
    }

    /* ──────────────────────────────────────────────────────────
       TAB SYSTEM
       ────────────────────────────────────────────────────────── */
    function initTabs() {
        dom.tabBtns.forEach((btn) => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });
    }

    function switchTab(tabId) {
        state.currentTab = tabId;

        dom.tabBtns.forEach((btn) => {
            const isActive = btn.dataset.tab === tabId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive);
        });

        dom.tabPanels.forEach((panel) => {
            const isActive = panel.id === `panel-${tabId}`;
            panel.classList.toggle('active', isActive);
        });

        // Scroll to top of main content smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
        saveState();
    }

    /* ──────────────────────────────────────────────────────────
       DROPZONE & FILE UPLOAD
       ────────────────────────────────────────────────────────── */
    function initDropzone() {
        const dz = dom.dropzone;

        // Drag events
        ['dragenter', 'dragover'].forEach((evt) => {
            dz.addEventListener(evt, (e) => {
                e.preventDefault();
                dz.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach((evt) => {
            dz.addEventListener(evt, (e) => {
                e.preventDefault();
                dz.classList.remove('drag-over');
            });
        });

        dz.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) handleFile(files[0]);
        });

        // Click / browse
        dom.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleFile(e.target.files[0]);
        });

        // Remove file
        dom.removeFileBtn.addEventListener('click', clearFile);
    }

    function handleFile(file) {
        const isImage = file.type.startsWith('image/');
        const isAudio = file.type.startsWith('audio/');

        if (!isImage && !isAudio) {
            showToast('Please upload an image or audio file.', 'error');
            return;
        }

        state.uploadedFile = file;

        // Show preview
        dom.filePreview.classList.remove('hidden');
        dom.previewFilename.textContent = file.name;
        dom.previewFilesize.textContent = formatFileSize(file.size);

        if (isImage) {
            dom.previewImageWrap.classList.remove('hidden');
            dom.previewAudioWrap.classList.add('hidden');
            const reader = new FileReader();
            reader.onload = (e) => { dom.previewImage.src = e.target.result; };
            reader.readAsDataURL(file);
        } else {
            dom.previewAudioWrap.classList.remove('hidden');
            dom.previewImageWrap.classList.add('hidden');
        }

        dom.btnTranscribe.disabled = false;
    }

    function clearFile() {
        state.uploadedFile = null;
        dom.filePreview.classList.add('hidden');
        dom.previewImageWrap.classList.add('hidden');
        dom.previewAudioWrap.classList.add('hidden');
        dom.previewImage.src = '';
        dom.fileInput.value = '';
        dom.btnTranscribe.disabled = true;
    }

    /* ──────────────────────────────────────────────────────────
       TRANSCRIBE
       ────────────────────────────────────────────────────────── */
    function initTranscribe() {
        dom.btnTranscribe.addEventListener('click', doTranscribe);
        dom.btnCopyTranscription.addEventListener('click', () => {
            copyToClipboard(state.transcriptionResult);
        });
        dom.btnSendToTranslate.addEventListener('click', () => {
            dom.sourceText.value = state.transcriptionResult;
            switchTab('translate');
            saveState();
        });
        dom.btnSendToTransform.addEventListener('click', () => {
            dom.storyInput.value = state.transcriptionResult;
            switchTab('transform');
            saveState();
        });
    }

    async function doTranscribe() {
        if (!state.uploadedFile) return;

        const formData = new FormData();
        formData.append('file', state.uploadedFile);
        const lang = dom.transcribeLang.value.trim();
        if (lang) formData.append('language', lang);

        showLoading();
        try {
            const res = await apiFetch('/api/transcribe', { method: 'POST', body: formData });
            const data = await handleResponse(res);
            state.transcriptionResult = data.transcription || data.text || JSON.stringify(data, null, 2);
            dom.transcriptionText.textContent = state.transcriptionResult;
            dom.transcribeResults.classList.remove('hidden');
            showToast('Transcription complete!', 'success');
            saveState();
        } catch (err) {
            showToast(`Transcription failed: ${err.message}`, 'error');
        } finally {
            hideLoading();
        }
    }

    /* ──────────────────────────────────────────────────────────
       TRANSLATE
       ────────────────────────────────────────────────────────── */
    function initTranslate() {
        dom.btnTranslate.addEventListener('click', doTranslate);
        dom.btnSwapLangs.addEventListener('click', swapLanguages);
        dom.btnCopyTranslation.addEventListener('click', () => {
            copyToClipboard(state.translationResult);
        });
        dom.btnTranslatedToTransform.addEventListener('click', () => {
            dom.storyInput.value = state.translationResult;
            switchTab('transform');
            saveState();
        });
    }

    function swapLanguages() {
        const src = dom.sourceLang.value;
        const tgt = dom.targetLang.value;
        if (src === 'auto') {
            showToast('Cannot swap when source is Auto-detect', 'info');
            return;
        }
        dom.sourceLang.value = tgt;
        dom.targetLang.value = src;

        // Swap texts too if translation exists
        if (state.translationResult) {
            const oldSource = dom.sourceText.value;
            dom.sourceText.value = state.translationResult;
            dom.translatedText.textContent = oldSource;
            state.translationResult = oldSource;
        }
    }

    async function doTranslate() {
        const text = dom.sourceText.value.trim();
        if (!text) {
            showToast('Please enter text to translate.', 'error');
            return;
        }

        const payload = {
            text,
            source_language: dom.sourceLang.value,
            target_language: dom.targetLang.value,
        };
        const ctx = dom.translateContext.value.trim();
        if (ctx) payload.context = ctx;

        showLoading();
        try {
            const res = await apiFetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await handleResponse(res);
            state.translationResult = data.translation || data.translated_text || JSON.stringify(data, null, 2);
            dom.translatedText.textContent = state.translationResult;
            dom.btnCopyTranslation.classList.remove('hidden');
            dom.btnTranslatedToTransform.classList.remove('hidden');
            showToast('Translation complete!', 'success');
            saveState();
        } catch (err) {
            showToast(`Translation failed: ${err.message}`, 'error');
        } finally {
            hideLoading();
        }
    }

    /* ──────────────────────────────────────────────────────────
       TRANSFORM (Story Generation)
       ────────────────────────────────────────────────────────── */
    function initTransform() {
        // Format card selection
        dom.formatCards.forEach((card) => {
            card.addEventListener('click', () => {
                dom.formatCards.forEach((c) => c.classList.remove('selected'));
                card.classList.add('selected');
                state.storyFormat = card.dataset.format;
            });
        });

        dom.btnGenerateStory.addEventListener('click', doGenerateStory);
        dom.btnCopyStory.addEventListener('click', () => {
            copyToClipboard(state.storyRawText);
        });
        dom.btnSendToNarrate.addEventListener('click', () => {
            dom.narrateText.value = state.storyRawText;
            state.isPodcastContent = state.storyFormat === 'podcast_script';
            dom.btnNarratePodcast.classList.toggle('hidden', !state.isPodcastContent);
            switchTab('narrate');
            saveState();
        });
    }

    async function doGenerateStory() {
        const text = dom.storyInput.value.trim();
        if (!text) {
            showToast('Please enter historical content to transform.', 'error');
            return;
        }

        const payload = {
            text,
            format: state.storyFormat,
            style: dom.storyStyle.value.trim() || 'engaging',
            language: dom.storyLang.value || 'en',
        };

        showLoading();
        try {
            const res = await apiFetch('/api/generate-story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await handleResponse(res);
            state.storyResult = data;
            state.storyRawText = data.story || data.script || data.content || data.text || JSON.stringify(data, null, 2);
            renderStoryResult(data);
            dom.storyResults.classList.remove('hidden');
            showToast('Story generated!', 'success');
            saveState();
        } catch (err) {
            showToast(`Story generation failed: ${err.message}`, 'error');
        } finally {
            hideLoading();
        }
    }

    function renderStoryResult(data) {
        const container = dom.storyContent;
        container.innerHTML = '';

        const format = state.storyFormat;

        // Update title icon
        const icons = {
            interactive_story: '<i class="fas fa-book-open"></i> Interactive Story',
            podcast_script: '<i class="fas fa-podcast"></i> Podcast Script',
            guided_tour: '<i class="fas fa-map-location-dot"></i> Guided Tour',
        };
        dom.storyResultTitle.innerHTML = icons[format] || '<i class="fas fa-book-open"></i> Your Story';

        if (format === 'interactive_story') {
            renderInteractiveStory(container, data);
        } else if (format === 'podcast_script') {
            renderPodcastScript(container, data);
        } else if (format === 'guided_tour') {
            renderGuidedTour(container, data);
        } else {
            container.innerHTML = `<div class="parchment-text">${escapeHtml(state.storyRawText)}</div>`;
        }
    }

    function renderInteractiveStory(container, data) {
        // Try to parse structured scenes, fallback to plain text
        const scenes = data.scenes || data.chapters || null;
        if (scenes && Array.isArray(scenes)) {
            scenes.forEach((scene, idx) => {
                const div = document.createElement('div');
                div.className = 'story-scene';
                let html = `<p>${escapeHtml(scene.text || scene.content || scene.description || '')}</p>`;

                if (scene.choices && Array.isArray(scene.choices)) {
                    html += '<div class="story-choices">';
                    scene.choices.forEach((choice) => {
                        html += `<button class="story-choice-btn" data-next="${choice.next || ''}">`
                            + `<i class="fas fa-chevron-right" style="margin-right:.5rem;color:var(--clr-gold);"></i>`
                            + `${escapeHtml(choice.text || choice.label || choice)}`
                            + `</button>`;
                    });
                    html += '</div>';
                }
                div.innerHTML = html;
                container.appendChild(div);
            });

            // Attach choice handlers
            container.querySelectorAll('.story-choice-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    showToast(`You chose: "${btn.textContent.trim()}"`, 'info');
                    btn.style.borderColor = 'var(--clr-burgundy)';
                    btn.style.background = 'rgba(139,26,26,0.08)';
                });
            });
        } else {
            // Fallback: render as styled text
            const div = document.createElement('div');
            div.className = 'story-scene';
            div.innerHTML = formatStoryText(state.storyRawText);
            container.appendChild(div);
        }
    }

    function renderPodcastScript(container, data) {
        const lines = data.dialogue || data.lines || data.script_lines || null;
        if (lines && Array.isArray(lines)) {
            lines.forEach((line) => {
                const div = document.createElement('div');
                div.className = 'podcast-line';
                div.innerHTML = `
                    <div class="podcast-speaker">${escapeHtml(line.speaker || line.name || 'Speaker')}</div>
                    <div class="podcast-dialogue">${escapeHtml(line.text || line.dialogue || line.content || '')}</div>
                `;
                container.appendChild(div);
            });
        } else {
            // Parse from raw text: look for "Speaker:" patterns
            const rawLines = state.storyRawText.split('\n').filter(l => l.trim());
            rawLines.forEach((line) => {
                const match = line.match(/^([A-Z][A-Za-z\s]+?):\s*(.+)$/);
                const div = document.createElement('div');
                if (match) {
                    div.className = 'podcast-line';
                    div.innerHTML = `
                        <div class="podcast-speaker">${escapeHtml(match[1])}</div>
                        <div class="podcast-dialogue">${escapeHtml(match[2])}</div>
                    `;
                } else {
                    div.className = 'podcast-line';
                    div.innerHTML = `<div class="podcast-dialogue" style="margin-left:0">${escapeHtml(line)}</div>`;
                }
                container.appendChild(div);
            });
        }
    }

    function renderGuidedTour(container, data) {
        const stops = data.stops || data.locations || data.tour_stops || null;
        if (stops && Array.isArray(stops)) {
            stops.forEach((stop, idx) => {
                const div = document.createElement('div');
                div.className = 'tour-stop';
                div.innerHTML = `
                    <div class="tour-stop-number">Stop ${idx + 1}</div>
                    <div class="tour-stop-title">${escapeHtml(stop.title || stop.name || stop.location || `Stop ${idx + 1}`)}</div>
                    <div class="tour-stop-description">${escapeHtml(stop.description || stop.text || stop.content || '')}</div>
                `;
                container.appendChild(div);
            });
        } else {
            // Fallback: split by paragraphs and render as stops
            const paragraphs = state.storyRawText.split(/\n\n+/).filter(p => p.trim());
            paragraphs.forEach((p, idx) => {
                const div = document.createElement('div');
                div.className = 'tour-stop';
                div.innerHTML = `
                    <div class="tour-stop-number">Stop ${idx + 1}</div>
                    <div class="tour-stop-description">${escapeHtml(p.trim())}</div>
                `;
                container.appendChild(div);
            });
        }
    }

    /* ──────────────────────────────────────────────────────────
       NARRATE
       ────────────────────────────────────────────────────────── */
    function initNarrate() {
        dom.btnNarrate.addEventListener('click', doNarrate);
        dom.btnNarratePodcast.addEventListener('click', doNarratePodcast);

        dom.voiceSelect.addEventListener('change', () => {
            const voiceId = dom.voiceSelect.value;
            const voice = state.voices.find(v => v.id === voiceId || v.voice_id === voiceId);
            dom.voiceDescription.textContent = voice ? (voice.description || voice.preview_text || '') : '';
        });
    }

    async function doNarrate() {
        const text = dom.narrateText.value.trim();
        if (!text) {
            showToast('Please enter text to narrate.', 'error');
            return;
        }

        const payload = {
            text,
            voice: dom.voiceSelect.value,
            style: dom.narrateStyle.value.trim() || 'warm storytelling',
        };

        showLoading();
        try {
            const res = await apiFetch('/api/narrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || errData.message || `HTTP ${res.status}`);
            }

            const contentType = res.headers.get('Content-Type') || '';
            let audioUrl;

            if (contentType.includes('audio') && !contentType.includes('json')) {
                const blob = await res.blob();
                audioUrl = URL.createObjectURL(blob);
            } else {
                const data = await res.json();
                if (data.audio) {
                    audioUrl = `data:${data.mime_type || 'audio/wav'};base64,${data.audio}`;
                } else {
                    audioUrl = data.audio_url || data.url || data.audio_path;
                    if (audioUrl && !audioUrl.startsWith('http') && !audioUrl.startsWith('blob:') && !audioUrl.startsWith('data:')) {
                        audioUrl = audioUrl.startsWith('/') ? audioUrl : '/' + audioUrl;
                    }
                }
            }

            if (audioUrl) {
                dom.narrationAudio.src = audioUrl;
                dom.btnDownloadAudio.href = audioUrl;
                dom.narrateResults.classList.remove('hidden');
                showToast('Sarvam Bulbul narration generated!', 'success');
                dom.narrateResults.scrollIntoView({ behavior: 'smooth' });
            } else {
                showToast('No audio returned.', 'error');
            }
        } catch (err) {
            showToast(`Narration error: ${err.message}`, 'error');
        } finally {
            hideLoading();
        }
    }

    async function doNarratePodcast() {
        const text = dom.narrateText.value.trim();
        if (!text) {
            showToast('Please enter podcast script to narrate.', 'error');
            return;
        }

        const payload = {
            script: text,
            voice: dom.voiceSelect.value,
            style: dom.narrateStyle.value.trim() || 'conversational',
        };

        showLoading();
        try {
            const res = await apiFetch('/api/narrate-podcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || errData.message || `HTTP ${res.status}`);
            }

            const contentType = res.headers.get('Content-Type') || '';
            let audioUrl;

            if (contentType.includes('audio') && !contentType.includes('json')) {
                const blob = await res.blob();
                audioUrl = URL.createObjectURL(blob);
            } else {
                const data = await res.json();
                if (data.audio) {
                    audioUrl = `data:${data.mime_type || 'audio/wav'};base64,${data.audio}`;
                } else {
                    audioUrl = data.audio_url || data.url || data.audio_path;
                    if (audioUrl && !audioUrl.startsWith('http') && !audioUrl.startsWith('blob:') && !audioUrl.startsWith('data:')) {
                        audioUrl = audioUrl.startsWith('/') ? audioUrl : '/' + audioUrl;
                    }
                }
            }

            if (audioUrl) {
                dom.narrationAudio.src = audioUrl;
                dom.btnDownloadAudio.href = audioUrl;
                dom.narrateResults.classList.remove('hidden');
                showToast('Podcast audio generated with Sarvam Bulbul!', 'success');
                dom.narrateResults.scrollIntoView({ behavior: 'smooth' });
            } else {
                showToast('No audio returned.', 'error');
            }
        } catch (err) {
            showToast(`Podcast narration error: ${err.message}`, 'error');
        } finally {
            hideLoading();
        }
    }

    /* ──────────────────────────────────────────────────────────
       FETCH LANGUAGES & VOICES
       ────────────────────────────────────────────────────────── */
    async function fetchLanguages() {
        try {
            const res = await fetch('/api/languages');
            if (!res.ok) return;
            const data = await res.json();
            const languages = data.languages || data || [];
            state.languages = languages;
            populateLanguageSelects(languages);
        } catch (err) {
            console.warn('Could not load languages:', err);
            // Populate with defaults
            populateLanguageSelects(getDefaultLanguages());
        }
    }

    function getDefaultLanguages() {
        return [
            { code: 'en', name: 'English' },
            { code: 'hi', name: 'Hindi' },
            { code: 'sa', name: 'Sanskrit' },
            { code: 'ar', name: 'Arabic' },
            { code: 'fa', name: 'Persian' },
            { code: 'ta', name: 'Tamil' },
            { code: 'te', name: 'Telugu' },
            { code: 'bn', name: 'Bengali' },
            { code: 'ur', name: 'Urdu' },
            { code: 'fr', name: 'French' },
            { code: 'de', name: 'German' },
            { code: 'es', name: 'Spanish' },
            { code: 'pt', name: 'Portuguese' },
            { code: 'zh', name: 'Chinese' },
            { code: 'ja', name: 'Japanese' },
            { code: 'la', name: 'Latin' },
            { code: 'el', name: 'Greek' },
        ];
    }

    function populateLanguageSelects(languages) {
        const selects = [dom.sourceLang, dom.targetLang, dom.storyLang];

        selects.forEach((sel) => {
            // Keep the first option (auto-detect or English)
            const firstOpt = sel.querySelector('option');
            sel.innerHTML = '';
            if (firstOpt) sel.appendChild(firstOpt);

            languages.forEach((lang) => {
                const code = lang.code || lang.id || lang.value || lang;
                const name = lang.name || lang.label || lang;
                const opt = document.createElement('option');
                opt.value = code;
                opt.textContent = name;
                sel.appendChild(opt);
            });
        });

        // Set target language to English if available
        if (dom.targetLang.querySelector('option[value="en"]')) {
            dom.targetLang.value = 'en';
        }
    }

    async function fetchVoices() {
        try {
            const res = await fetch('/api/voices');
            if (!res.ok) return;
            const data = await res.json();
            const voices = data.voices || data || [];
            state.voices = voices;
            populateVoiceSelect(voices);
        } catch (err) {
            console.warn('Could not load voices:', err);
            populateVoiceSelect(getDefaultVoices());
        }
    }

    function getDefaultVoices() {
        return [
            { id: 'alloy', name: 'Alloy', description: 'Warm and balanced storytelling voice' },
            { id: 'echo', name: 'Echo', description: 'Clear and resonant narrator' },
            { id: 'fable', name: 'Fable', description: 'Dramatic and expressive' },
            { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative' },
            { id: 'nova', name: 'Nova', description: 'Bright and engaging' },
            { id: 'shimmer', name: 'Shimmer', description: 'Gentle and melodic' },
        ];
    }

    function populateVoiceSelect(voices) {
        dom.voiceSelect.innerHTML = '';
        voices.forEach((voice) => {
            const id = voice.id || voice.voice_id || voice.value || voice;
            const name = voice.name || voice.label || voice;
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = name;
            dom.voiceSelect.appendChild(opt);
        });

        // Show first voice description
        if (voices.length > 0) {
            dom.voiceDescription.textContent = voices[0].description || voices[0].preview_text || '';
        }
    }

    /* ──────────────────────────────────────────────────────────
       LOADING OVERLAY
       ────────────────────────────────────────────────────────── */
    function showLoading() {
        dom.loadingOverlay.classList.remove('hidden');
    }

    function hideLoading() {
        dom.loadingOverlay.classList.add('hidden');
    }

    /* ──────────────────────────────────────────────────────────
       TOAST NOTIFICATIONS
       ────────────────────────────────────────────────────────── */
    function showToast(message, type = 'info', duration = 4500) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: 'fa-check-circle',
            error:   'fa-exclamation-circle',
            info:    'fa-info-circle',
        };

        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info} toast-icon"></i>
            <div class="toast-body">${escapeHtml(message)}</div>
            <button class="toast-close" aria-label="Close notification">&times;</button>
        `;

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));

        container.appendChild(toast);

        // Auto-remove
        setTimeout(() => removeToast(toast), duration);
    }

    function removeToast(toast) {
        if (!toast || !toast.parentNode) return;
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }

    /* ──────────────────────────────────────────────────────────
       CLIPBOARD
       ────────────────────────────────────────────────────────── */
    async function copyToClipboard(text) {
        if (!text) {
            showToast('Nothing to copy.', 'info');
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            showToast('Copied to clipboard!', 'success');
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
            showToast('Copied to clipboard!', 'success');
        }
    }

    /* ──────────────────────────────────────────────────────────
       API HELPERS
       ────────────────────────────────────────────────────────── */
    async function handleResponse(res) {
        if (!res.ok) {
            let errMsg = `Server error (${res.status})`;
            try {
                const errData = await res.json();
                errMsg = errData.error || errData.message || errData.detail || errMsg;
            } catch {}
            throw new Error(errMsg);
        }
        return res.json();
    }

    /* ──────────────────────────────────────────────────────────
       LOCAL STORAGE PERSISTENCE
       ────────────────────────────────────────────────────────── */
    const STORAGE_KEY = 'hsa-app-state';

    function saveState() {
        const toSave = {
            currentTab: state.currentTab,
            transcriptionResult: state.transcriptionResult,
            translationResult: state.translationResult,
            storyRawText: state.storyRawText,
            storyFormat: state.storyFormat,
            isPodcastContent: state.isPodcastContent,
            sourceText: dom.sourceText.value,
            storyInput: dom.storyInput.value,
            narrateText: dom.narrateText.value,
            storyStyle: dom.storyStyle.value,
            narrateStyle: dom.narrateStyle.value,
            sourceLang: dom.sourceLang.value,
            targetLang: dom.targetLang.value,
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        } catch {}
    }

    function restoreState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return;
            const data = JSON.parse(saved);

            if (data.currentTab) switchTab(data.currentTab);
            if (data.transcriptionResult) {
                state.transcriptionResult = data.transcriptionResult;
                dom.transcriptionText.textContent = data.transcriptionResult;
                dom.transcribeResults.classList.remove('hidden');
            }
            if (data.translationResult) {
                state.translationResult = data.translationResult;
                dom.translatedText.textContent = data.translationResult;
                dom.btnCopyTranslation.classList.remove('hidden');
                dom.btnTranslatedToTransform.classList.remove('hidden');
            }
            if (data.sourceText) dom.sourceText.value = data.sourceText;
            if (data.storyInput) dom.storyInput.value = data.storyInput;
            if (data.narrateText) dom.narrateText.value = data.narrateText;
            if (data.storyStyle) dom.storyStyle.value = data.storyStyle;
            if (data.narrateStyle) dom.narrateStyle.value = data.narrateStyle;
            if (data.storyFormat) {
                state.storyFormat = data.storyFormat;
                dom.formatCards.forEach(c => {
                    c.classList.toggle('selected', c.dataset.format === data.storyFormat);
                });
            }
            if (data.storyRawText) {
                state.storyRawText = data.storyRawText;
            }
            if (data.isPodcastContent) {
                state.isPodcastContent = data.isPodcastContent;
                dom.btnNarratePodcast.classList.toggle('hidden', !data.isPodcastContent);
            }

            // Language selects restored after population
            setTimeout(() => {
                if (data.sourceLang) dom.sourceLang.value = data.sourceLang;
                if (data.targetLang) dom.targetLang.value = data.targetLang;
            }, 500);
        } catch (err) {
            console.warn('Could not restore state:', err);
        }
    }

    // Auto-save on text input changes (debounced)
    let saveTimer = null;
    document.addEventListener('input', () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveState, 1000);
    });

    /* ──────────────────────────────────────────────────────────
       UTILITIES
       ────────────────────────────────────────────────────────── */
    function escapeHtml(str) {
        if (typeof str !== 'string') return str;
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function formatStoryText(text) {
        // Convert line breaks to <p> tags for nicer display
        return text
            .split(/\n\n+/)
            .filter(p => p.trim())
            .map(p => `<p>${escapeHtml(p.trim())}</p>`)
            .join('');
    }

})();

