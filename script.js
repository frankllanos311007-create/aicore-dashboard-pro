document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    const menuBtns = document.querySelectorAll('.menu-btn');
    const pages = document.querySelectorAll('.page');
    const tableBody = document.getElementById('table-body');
    const galleryContainer = document.getElementById('gallery-container');

    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formTrack = document.getElementById('form-track');
    const cardSubtitle = document.getElementById('card-subtitle');
    const toastContainer = document.getElementById('toast-container');

    // 0. Toast Notification System
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <div class="toast-content">${message}</div>
            <span class="toast-close">&times;</span>
        `;

        toastContainer.appendChild(toast);

        // Force reflow for transition
        toast.offsetHeight;
        toast.classList.add('show');

        // Close on click
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        });

        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 500);
            }
        }, 4000);
    }

    // Initialize Local Database of Users
    let users = JSON.parse(localStorage.getItem('aicore_users'));
    if (!users) {
        users = [
            { username: 'admin', password: 'admin123', email: 'admin@ai-core.com' }
        ];
        localStorage.setItem('aicore_users', JSON.stringify(users));
    }

    // Load Remembered User
    const rememberedUser = localStorage.getItem('aicore_remembered_user');
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        const rememberCheckbox = document.getElementById('remember');
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }

    // Tab Switching Logic
    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formTrack.style.transform = 'translateX(0)';
        cardSubtitle.textContent = 'Ingresa al futuro de la tecnología';
    });

    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formTrack.style.transform = 'translateX(-50%)';
        cardSubtitle.textContent = 'Únete a la revolución de la IA';
    });

    // Password Visibility Toggles
    document.querySelectorAll('.password-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const wrapper = button.closest('.input-wrapper');
            const input = wrapper.querySelector('input');
            const eyeOpen = button.querySelector('.eye-open');
            const eyeClosed = button.querySelector('.eye-closed');

            if (input.type === 'password') {
                input.type = 'text';
                eyeOpen.style.display = 'none';
                eyeClosed.style.display = 'block';
            } else {
                input.type = 'password';
                eyeOpen.style.display = 'block';
                eyeClosed.style.display = 'none';
            }
        });
    });

    // Forgot Password Action
    const forgotPasswordLink = document.getElementById('forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Función de recuperación enviada al correo registrado.', 'info');
        });
    }

    // Social Button Feedback
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const provider = btn.classList.contains('google-btn') ? 'Google' : 'GitHub';
            showToast(`Iniciando sesión segura con ${provider}...`, 'info');
        });
    });



    // 1. Handle Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Look up user
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

        if (user) {
            // Update header user display
            document.getElementById('display-user').textContent = user.username;
            // Generate initials for avatar
            const initials = user.username.substring(0, 2).toUpperCase();
            const initialsEl = document.getElementById('user-initials');
            if (initialsEl) initialsEl.textContent = initials;

            showToast(`¡Bienvenido de vuelta, ${user.username}!`, 'success');
            
            // Handle Remember Me
            const rememberCheckbox = document.getElementById('remember');
            if (rememberCheckbox && rememberCheckbox.checked) {
                localStorage.setItem('aicore_remembered_user', user.username);
            } else {
                localStorage.removeItem('aicore_remembered_user');
            }

            loginScreen.style.opacity = '0';
            setTimeout(() => {
                loginScreen.style.display = 'none';
                mainApp.classList.add('active');
                loginForm.reset();
                // Retain remembered user after reset
                const remUser = localStorage.getItem('aicore_remembered_user');
                if (remUser) {
                    document.getElementById('username').value = remUser;
                    rememberCheckbox.checked = true;
                }
                
                // Initialize menu indicator coordinates
                setTimeout(() => {
                    const activeBtn = document.querySelector('.menu-btn.active');
                    if (activeBtn) updateMenuIndicator(activeBtn);
                }, 300);
            }, 500);
        } else {
            showToast('Usuario o contraseña incorrectos.', 'error');
            // Shake the login card on error
            const loginCard = document.querySelector('.login-card');
            if (loginCard) {
                loginCard.classList.remove('shake');
                void loginCard.offsetWidth;
                loginCard.classList.add('shake');
                setTimeout(() => loginCard.classList.remove('shake'), 600);
            }
        }
    });

    // 1b. Handle Registration
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        // Validations
        if (username.length < 3) {
            showToast('El usuario debe tener al menos 3 caracteres.', 'error');
            return;
        }

        // Email regex validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Por favor, ingresa un correo electrónico válido.', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('La contraseña debe tener al menos 6 caracteres.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Las contraseñas no coinciden.', 'error');
            return;
        }

        // Check if username already exists (case-insensitive)
        const usernameExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
        if (usernameExists) {
            showToast('El nombre de usuario ya está registrado.', 'error');
            return;
        }

        // Check if email already exists
        const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
            showToast('El correo electrónico ya está registrado.', 'error');
            return;
        }

        // Save new user
        const newUser = { username, email, password };
        users.push(newUser);
        localStorage.setItem('aicore_users', JSON.stringify(users));

        // Enviar a Google Sheets
        enviarAGoogleSheets(newUser);

        showToast('¡Cuenta creada con éxito! Ya puedes iniciar sesión.', 'success');

        // Reset registration form and hide visible passwords if toggled
        registerForm.reset();
        registerForm.querySelectorAll('.password-toggle').forEach(btn => {
            const wrapper = btn.closest('.input-wrapper');
            const input = wrapper.querySelector('input');
            input.type = 'password';
            btn.querySelector('.eye-open').style.display = 'block';
            btn.querySelector('.eye-closed').style.display = 'none';
        });

        // Switch back to login tab and pre-populate username
        setTimeout(() => {
            tabLogin.click();
            document.getElementById('username').value = username;
            document.getElementById('password').focus();
        }, 1200);
    });

    // Función para enviar datos a Google Sheets
    function enviarAGoogleSheets(userData) {
        const scriptURL = 'https://script.google.com/macros/s/AKfycbxNKFXPdOynO2tQ_huncCitQ_WTTzLWZFqrFSl36abBzLzCHmZQUC2gLMrRAuJ5-Lg/exec';
        
        const formData = new FormData();
        formData.append('username', userData.username);
        formData.append('email', userData.email);
        formData.append('password', userData.password);

        fetch(scriptURL, { 
            method: 'POST', 
            mode: 'no-cors',
            body: formData 
        })
        .then(() => console.log('¡Datos enviados exitosamente a Google Sheets!'))
        .catch(error => console.error('Error de conexión con Google Sheets', error));
    }

    // 1c. Handle Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        showToast('Sesión cerrada correctamente. ¡Hasta pronto!', 'info');
        mainApp.classList.remove('active');
        if (menuIndicator) menuIndicator.style.opacity = '0';
        setTimeout(() => {
            loginScreen.style.display = 'flex';
            loginScreen.style.opacity = '1';
            loginScreen.style.pointerEvents = 'all';
            tabLogin.click();
        }, 600);
    });

    // 1d. Handle Sidebar Collapse Toggle
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            mainApp.classList.toggle('sidebar-collapsed');
            
            // Fluid re-alignment of sliding background bubble after layout animation ends
            setTimeout(() => {
                const activeBtn = document.querySelector('.menu-btn.active');
                if (activeBtn) updateMenuIndicator(activeBtn);
            }, 250);
        });
    }

    // Fluid Sidebar Indicator
    const menuIndicator = document.getElementById('menu-indicator');
    function updateMenuIndicator(activeBtn) {
        if (!menuIndicator || !activeBtn) return;
        
        menuIndicator.style.opacity = '1';

        // Calculate offset relative to parent container (.menu-items)
        const containerTop = activeBtn.parentElement.getBoundingClientRect().top;
        const btnRect = activeBtn.getBoundingClientRect();
        
        const topPos = btnRect.top - containerTop;
        const height = btnRect.height;

        // Apply a springy transform for better animation
        menuIndicator.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease';
        menuIndicator.style.transform = `translateY(${topPos}px)`;
        menuIndicator.style.height = `${height}px`;
    }

    // Initialize indicator on the first active button
    const initialActive = document.querySelector('.menu-btn.active');
    if (initialActive) {
        setTimeout(() => updateMenuIndicator(initialActive), 100);
    }

    // Keep indicator aligned on window resize
    window.addEventListener('resize', () => {
        const activeBtn = document.querySelector('.menu-btn.active');
        if (activeBtn) updateMenuIndicator(activeBtn);
    });

    // 2. Menu Navigation
    menuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPage = btn.getAttribute('data-page');
            if (!targetPage) return;

            menuBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update sliding marker coordinates
            updateMenuIndicator(btn);

            pages.forEach(page => {
                page.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                page.classList.remove('active');
                if (page.id === targetPage) {
                    setTimeout(() => {
                        page.classList.add('active');
                        // Trigger progress bar animations when Caracteristicas page opens
                        if (targetPage === 'caracteristicas') {
                            animateProgressBars();
                        }
                    }, 100);
                }
            });
        });
    });

    // Animate progress bars on the Caracteristicas page
    function animateProgressBars() {
        const fills = document.querySelectorAll('.maturity-fill');
        fills.forEach(fill => {
            const targetWidth = fill.style.width;
            fill.style.width = '0';
            fill.style.transition = 'none';
            void fill.offsetWidth; // force reflow
            fill.style.transition = 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
            setTimeout(() => {
                fill.style.width = targetWidth;
            }, 120);
        });
    }

    // 3. Populate DataGrid (Interactive Table with Filters)
    const iaData = [
        { cat: 'IA Estrecha', tipo: 'Reactiva', arch: 'Filtros Colaborativos', ejemplo: 'Deep Blue / AlphaGo', alcance: 'Básica/Monotarea', estado: 'Actual' },
        { cat: 'IA Estrecha', tipo: 'Memoria Limitada', arch: 'LSTM / RNN / Transformers', ejemplo: 'ChatGPT-4o / Claude 3', alcance: 'Media/Adaptativa', estado: 'Actual' },
        { cat: 'IA General (AGI)', tipo: 'Teoría de la Mente', arch: 'Sistemas Autónomos Multi-Agente', ejemplo: 'Modelos de Razonamiento o1/o3', alcance: 'Avanzada/Cognitiva', estado: 'En Desarrollo' },
        { cat: 'IA General (AGI)', tipo: 'Autoconciencia', arch: 'Redes Neuronales Dinámicas Líquidas', ejemplo: 'Hipótesis de Conciencia Emergente', alcance: 'Humana/General', estado: 'Teórico/Futuro' },
        { cat: 'Super IA (ASI)', tipo: 'Cognición Superior', arch: 'Algoritmos Cuánticos Auto-Evolutivos', ejemplo: 'Singularidad Tecnológica', alcance: 'Sobrehumana', estado: 'Teórico/Futuro' },
        { cat: 'IA Generativa', tipo: 'Transformers / Difusión', arch: 'Mecanismo de Auto-Atención (Attention)', ejemplo: 'Midjourney / Sora', alcance: 'Creativa/Sintética', estado: 'Actual' }
    ];

    let activeFilter = 'all';

    function populateTable(filterState = 'all', searchQuery = '') {
        tableBody.innerHTML = '';
        
        const filtered = iaData.filter(item => {
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = !query || 
                item.cat.toLowerCase().includes(query) ||
                item.tipo.toLowerCase().includes(query) ||
                item.arch.toLowerCase().includes(query) ||
                item.ejemplo.toLowerCase().includes(query) ||
                item.alcance.toLowerCase().includes(query) ||
                item.estado.toLowerCase().includes(query);
            
            // Map pill categories properly
            let matchesFilter = true;
            if (filterState === 'Actual') {
                matchesFilter = item.estado === 'Actual';
            } else if (filterState === 'En Desarrollo') {
                matchesFilter = item.estado === 'En Desarrollo';
            } else if (filterState === 'Teórico/Futuro') {
                matchesFilter = item.estado === 'Teórico/Futuro';
            }
            
            return matchesSearch && matchesFilter;
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 2rem;">No se encontraron taxonomías que coincidan con la búsqueda.</td></tr>`;
            return;
        }

        filtered.forEach((item, index) => {
            const tr = document.createElement('tr');
            
            let badgeClass = 'badge-actual';
            if (item.estado === 'En Desarrollo') badgeClass = 'badge-desarrollo';
            if (item.estado === 'Teórico/Futuro') badgeClass = 'badge-teorico';
            
            tr.style.animation = `slideInUp 0.4s ease forwards ${index * 0.05}s`;
            tr.style.opacity = '0';
            tr.innerHTML = `
                <td style="font-weight: 600;">${item.cat}</td>
                <td style="color: var(--secondary); font-weight: 500;">${item.tipo}</td>
                <td style="font-family: monospace; font-size: 0.85rem; color: #a78bfa;">${item.arch}</td>
                <td>${item.ejemplo}</td>
                <td style="color: var(--text-dim); font-size: 0.875rem;">${item.alcance}</td>
                <td><span class="badge ${badgeClass}">${item.estado}</span></td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Connect Search and Filters
    const tableSearchInput = document.getElementById('table-search');
    const filterPillsContainer = document.getElementById('filter-pills');

    if (tableSearchInput) {
        tableSearchInput.addEventListener('input', (e) => {
            populateTable(activeFilter, e.target.value);
        });
    }

    if (filterPillsContainer) {
        filterPillsContainer.querySelectorAll('.filter-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                filterPillsContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                activeFilter = pill.getAttribute('data-filter');
                populateTable(activeFilter, tableSearchInput ? tableSearchInput.value : '');
            });
        });
    }

    // Run first taxonomy render
    populateTable('all', '');


    // 4. Premium Gallery details and Interactive Infecrence Sandbox
    const galleryItems = [
        { 
            name: 'ChatGPT-4o', 
            img: 'assets/img/chatgpt.png', 
            desc: 'Líder en lenguaje natural omni-direccional.', 
            developer: 'OpenAI',
            type: 'Multimodal Core',
            year: '2024',
            context: '128K',
            arch: 'Transformer MoE',
            fullDesc: 'GPT-4o ("o" de omni) es el modelo estrella de OpenAI, diseñado para procesar y razonar de forma nativa a través de texto, audio e imágenes en tiempo real. Su arquitectura de Mezcla de Expertos (MoE) optimiza la velocidad y calidad.',
            url: 'https://chatgpt.com',
            mmlu: 88.7,
            code: 90.2,
            ethics: 95.1,
            presets: [
                { prompt: 'Explica la teoría de cuerdas en 2 frases', reply: 'La teoría de cuerdas propone que los constituyentes fundamentales del universo no son partículas puntuales, sino filamentos de energía unidimensionales en constante vibración.\nLa frecuencia de estas vibraciones determina las propiedades físicas de las partículas que percibimos, unificando la relatividad general y la mecánica cuántica.' },
                { prompt: 'Escribe una función de ordenamiento rápido en JS', reply: 'const quicksort = arr => {\n  if (arr.length <= 1) return arr;\n  const pivot = arr[arr.length - 1];\n  const left = arr.filter((x, i) => x < pivot && i < arr.length - 1);\n  const right = arr.filter(x => x >= pivot);\n  return [...quicksort(left), pivot, ...quicksort(right)];\n};' }
            ]
        },
        { 
            name: 'Google Gemini Pro', 
            img: 'assets/img/gemini.png', 
            desc: 'IA Multimodal integrada de contexto millonario.', 
            developer: 'Google AI',
            type: 'Nativo Multimodal',
            year: '2024',
            context: '2000K (2M)',
            arch: 'Gemini Dense Transformer',
            fullDesc: 'Gemini Pro destaca por su ventana de contexto masiva que permite procesar millones de líneas de código o videos enteros de una sola vez. Construido desde cero para coordinar voz fotorrealista y razonamiento cruzado.',
            url: 'https://gemini.google.com',
            mmlu: 86.2,
            code: 84.1,
            ethics: 92.5,
            presets: [
                { prompt: '¿Ventajas de un contexto de 2M de tokens?', reply: 'Un contexto de 2 millones de tokens permite al modelo ingerir y correlacionar información de bases de conocimiento gigantescas al instante, como 20 horas de audio, 1 hora de video HD o más de 60,000 líneas de código en una sola consulta, eliminando la necesidad de segmentaciones complejas.' },
                { prompt: 'Analiza el snippet de error: TypeError is not a function', reply: 'Este error ocurre cuando intentas invocar un valor como si fuera una función, pero en realidad es undefined o de un tipo primitivo incompatible.\nEjemplo común:\nconst x = {};\nx.myMethod(); // TypeError: x.myMethod is not a function (ya que myMethod es undefined)' }
            ]
        },
        { 
            name: 'Claude 3.5 Sonnet', 
            img: 'assets/img/claude.png', 
            desc: 'El estado del arte en fluidez y código.', 
            developer: 'Anthropic',
            type: 'Razonamiento Avanzado',
            year: '2024',
            context: '200K',
            arch: 'Autoregressive Transformer',
            fullDesc: 'Claude 3.5 Sonnet establece nuevos estándares de rendimiento en razonamiento a nivel de postgrado, matemáticas de alto nivel y escritura académica fluida, destacando por su ética rigurosa, baja tasa de alucinación y honestidad intelectual.',
            url: 'https://claude.ai',
            mmlu: 88.7,
            code: 92.0,
            ethics: 97.8,
            presets: [
                { prompt: 'Escribe un poema breve sobre la entropía física', reply: 'El orden se rinde al silencio del viento,\nlas horas desgastan el mármol templado,\ncada átomo busca su libre momento,\ncon el caos eterno que el cosmos ha amado.' },
                { prompt: 'Dame 3 principios éticos clave de la IA', reply: '1. Transparencia y Explicabilidad: Comprender cuándo se interactúa con una IA y cómo decide.\n2. No Discriminación: Reducción activa de sesgos históricos en el entrenamiento.\n3. Seguridad y Control: Garantizar un marco de apagado estricto supervisado por humanos.' }
            ]
        },
        { 
            name: 'Midjourney v6', 
            img: 'assets/img/midjourney.png', 
            desc: 'Síntesis artística de fotorrealismo cinematográfico.', 
            developer: 'Midjourney Labs',
            type: 'Difusión de Imagen',
            year: '2024',
            context: 'Text-Prompted',
            arch: 'Latent Diffusion Model',
            fullDesc: 'Midjourney v6 es un modelo de difusión latente especializado en fotorrealismo de alta coherencia estricta, interpretación semántica exacta de prompts complejos y manipulación de estilos estéticos y cinematográficos premium.',
            url: 'https://www.midjourney.com',
            mmlu: 35.0,
            code: 10.0,
            ethics: 85.0,
            presets: [
                { prompt: 'Dame un prompt cyberpunk fotorrealista', reply: 'Prompt cinematográfico recomendado:\n"Neon flooded alleyway in Neo-Tokyo, reflection of pink and teal neon signage in puddles, cinematic fog, shot on 35mm lens, hyper-realistic, volumetric lighting, photorealistic 8k --ar 16:9 --style raw"' },
                { prompt: '¿Qué es el ruido en modelos de difusión?', reply: 'Los modelos de difusión crean imágenes mediante la de-construcción progresiva de ruido gaussiano estático. A lo largo de múltiples pasos (steps), eliminan este ruido de forma dirigida por la semántica del prompt del usuario.' }
            ]
        },
        { 
            name: 'OpenAI Sora', 
            img: 'assets/img/sora.png', 
            desc: 'Simulación de dinámicas físicas de video cinematográfico.', 
            developer: 'OpenAI',
            type: 'Generación de Video',
            year: '2024',
            context: '1 Min HD Video',
            arch: 'Diffusion Transformer (DiT)',
            fullDesc: 'Sora es un modelo de simulación que entiende no solo lo que solicita el prompt del usuario, sino cómo se comportan los objetos y la física real en el mundo tridimensional, permitiendo generar videos cinematográficos ultra coherentes.',
            url: 'https://openai.com/sora',
            mmlu: 45.0,
            code: 15.0,
            ethics: 82.0,
            presets: [
                { prompt: '¿Qué es un Diffusion Transformer?', reply: 'Un Diffusion Transformer (DiT) sustituye la estructura convolucional estándar (U-Net) por bloques de atención Transformer. Esto le confiere una mayor escalabilidad y una coherencia espacial excelente a lo largo del tiempo.' },
                { prompt: 'Dame un prompt de simulación de fluidos complejos', reply: 'Prompt recomendado:\n"Splashing waves inside a glass aquarium, macro shot, photorealistic fluid dynamics, underwater camera perspective, hyper-detailed volumetric sand --v 1080p"' }
            ]
        },
        { 
            name: 'GitHub Copilot (GPT-4o)', 
            img: 'assets/img/copilot.png', 
            desc: 'Asistente de código y refactorización inteligente en tiempo real.', 
            developer: 'GitHub / Microsoft',
            type: 'Autocompletado Técnico',
            year: '2024',
            context: '32K',
            arch: 'Decoder-Only Code Tuning',
            fullDesc: 'Copilot integra el conocimiento de millones de repositorios públicos de código abierto para actuar como el programador de par definitivo, autocompletando código y sugiriendo estructuras algorítmicas de forma inmediata en tu IDE.',
            url: 'https://github.com/features/copilot',
            mmlu: 82.0,
            code: 94.5,
            ethics: 88.0,
            presets: [
                { prompt: 'Escribe un test unitario en Python para login', reply: 'import unittest\nfrom auth import login_user\n\nclass TestLogin(unittest.TestCase):\n    def test_successful_login(self):\n        self.assertTrue(login_user("admin", "admin123"))\n\n    def test_failed_login(self):\n        self.assertFalse(login_user("admin", "wrong_pass"))' },
                { prompt: '¿Cómo optimizo un bucle nested O(n^2) en JS?', reply: 'La mejor forma es mapear tus búsquedas secundarias en un mapa de Hash (Object o Map) con acceso directo O(1). Esto reduce la complejidad global de tiempo de O(n^2) a un escaneo lineal simple O(n).' }
            ]
        }
    ];

    let currentPresetModel = null;
    let typingTimer = null;

    galleryItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.innerHTML = `
            <div class="gallery-card-badge">${item.developer}</div>
            <img src="${item.img}" alt="${item.name}">
            <div class="gallery-content-footer">
                <span class="gallery-item-dev">${item.type}</span>
                <h4 style="font-size: 1.15rem; font-weight: 700; color: white;">${item.name}</h4>
                <p style="font-size: 0.8rem; color: var(--text-dim); line-height: 1.3;">${item.desc}</p>
            </div>
            <div class="gallery-overlay">
                <button class="gallery-overlay-btn">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    Ver Ficha Técnica
                </button>
            </div>
        `;
        
        div.addEventListener('click', () => {
            const modal = document.getElementById('image-modal');
            if (modal) {
                loadModelToModal(item);
                modal.style.display = 'flex';
            }
        });

        galleryContainer.appendChild(div);
    });

    // Load Model detail fields inside the Bento modal
    function loadModelToModal(model) {
        currentPresetModel = model;
        
        // Text values
        document.getElementById('modal-title').textContent = model.name;
        document.getElementById('modal-developer').textContent = model.developer;
        document.getElementById('modal-img').src = model.img;
        document.getElementById('modal-desc').textContent = model.fullDesc;
        document.getElementById('modal-type-badge').textContent = model.type;
        document.getElementById('modal-official-link').href = model.url;
        
        document.getElementById('modal-spec-year').textContent = model.year;
        document.getElementById('modal-spec-context').textContent = model.context;
        document.getElementById('modal-spec-arch').textContent = model.arch;
        
        // Progress percentage trackers
        document.getElementById('bench-mmlu-val').textContent = `${model.mmlu}%`;
        document.getElementById('bench-mmlu-fill').style.width = `${model.mmlu}%`;
        
        document.getElementById('bench-code-val').textContent = `${model.code}%`;
        document.getElementById('bench-code-fill').style.width = `${model.code}%`;
        
        document.getElementById('bench-context-val').textContent = `${model.ethics}%`;
        document.getElementById('bench-context-fill').style.width = `${model.ethics}%`;
        
        // Reset playground log
        const chatContainer = document.getElementById('playground-chat');
        if (chatContainer) {
            chatContainer.innerHTML = `
                <div class="chat-bubble system">Iniciando sandbox del modelo ${model.name}. Selecciona un prompt recomendado o escribe tu consulta:</div>
            `;
        }
        
        // Load presets
        const presetsContainer = document.getElementById('playground-presets');
        if (presetsContainer) {
            presetsContainer.innerHTML = '';
            model.presets.forEach(preset => {
                const btn = document.createElement('button');
                btn.className = 'preset-btn';
                btn.textContent = preset.prompt;
                btn.addEventListener('click', () => {
                    triggerSimulation(preset.prompt, preset.reply);
                });
                presetsContainer.appendChild(btn);
            });
        }
    }

    // Typing effect typewriter
    function triggerSimulation(prompt, reply) {
        if (typingTimer) clearTimeout(typingTimer);
        
        const chatContainer = document.getElementById('playground-chat');
        if (!chatContainer) return;
        
        // 1. Append User prompt bubble
        const userBubble = document.createElement('div');
        userBubble.className = 'chat-bubble user';
        userBubble.textContent = prompt;
        chatContainer.appendChild(userBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // 2. Append thinking bubble
        const assistantBubble = document.createElement('div');
        assistantBubble.className = 'chat-bubble assistant';
        assistantBubble.textContent = 'Analizando embeddings... 🧠';
        chatContainer.appendChild(assistantBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // 3. Simulated typewriter answer streaming
        let currentTokenIndex = 0;
        const responseText = reply;
        assistantBubble.textContent = '';
        
        function typeToken() {
            if (currentTokenIndex < responseText.length) {
                const chunk = responseText.substring(currentTokenIndex, currentTokenIndex + 2);
                assistantBubble.textContent += chunk;
                currentTokenIndex += 2;
                
                // PERFORMANCE FIX: Only force scroll occasionally to avoid mobile layout-thrashing crash
                if (currentTokenIndex % 20 === 0) {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
                
                typingTimer = setTimeout(typeToken, 12);
            } else {
                // Ensure scrolled to bottom at the end
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }
        
        // Start streaming after 400ms lag
        setTimeout(typeToken, 400);
    }

    // Custom Playground prompt submissions
    const sendBtn = document.getElementById('playground-send-btn');
    const customInput = document.getElementById('playground-custom-input');

    function submitCustomPrompt() {
        if (!customInput || !customInput.value.trim() || !currentPresetModel) return;
        const userPrompt = customInput.value.trim();
        customInput.value = '';
        
        // Generate contextual response
        let replyText = `[Simulación de Inferencia - ${currentPresetModel.name}]\nInferencia exitosa.\n\nHe procesado tu prompt: "${userPrompt}".\n\nNavegando a través de mis ${currentPresetModel.context} tokens de límite de contexto, esta simulación en AI.CORE demuestra una respuesta precisa con temperatura adaptativa.`;
        
        const lowered = userPrompt.toLowerCase();
        if (lowered.includes('hola') || lowered.includes('buenos') || lowered.includes('saludos')) {
            replyText = `¡Hola! Soy el simulador cognitivo de ${currentPresetModel.name}. Estoy diseñado para ayudarte con generación de contenido, depuración de código y análisis lógico. ¿Qué tarea te gustaría simular hoy?`;
        } else if (lowered.includes('creador') || lowered.includes('creó') || lowered.includes('quien te')) {
            replyText = `Fui desarrollado y entrenado por los ingenieros y científicos de ${currentPresetModel.developer}. Mi arquitectura se basa en ${currentPresetModel.arch}.`;
        }
        
        triggerSimulation(userPrompt, replyText);
    }

    if (sendBtn && customInput) {
        sendBtn.addEventListener('click', submitCustomPrompt);
        customInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitCustomPrompt();
        });
    }

    // Close Bento Modal
    const modalBackdrop = document.getElementById('image-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    if (modalBackdrop && modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            if (typingTimer) clearTimeout(typingTimer);
            modalBackdrop.style.display = 'none';
        });
        
        // Close on clicking backdrop out-of-bounds
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                if (typingTimer) clearTimeout(typingTimer);
                modalBackdrop.style.display = 'none';
            }
        });
    }

    // Navigation via custom module dropdown
    const dropdownContainer = document.getElementById('module-dropdown-container');
    const dropdownTrigger = document.getElementById('module-dropdown-trigger');
    const dropdownMenu = document.getElementById('module-dropdown-menu');

    if (dropdownContainer && dropdownTrigger && dropdownMenu) {
        dropdownTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownContainer.classList.toggle('open');
        });

        dropdownMenu.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', () => {
                const targetPage = item.getAttribute('data-page');
                if (!targetPage) return;
                const btn = document.querySelector(`.menu-btn[data-page="${targetPage}"]`);
                if (btn) btn.click();
                dropdownContainer.classList.remove('open');
            });
        });

        document.addEventListener('click', (e) => {
            if (!dropdownContainer.contains(e.target)) {
                dropdownContainer.classList.remove('open');
            }
        });
    }

    // Live clock in footer
    const footerEl = document.querySelector('.footer p');
    function updateClock() {
        if (!footerEl) return;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        footerEl.innerHTML = `© 2026 AI.CORE Systems &nbsp;&bull;&nbsp; <span style="color: var(--secondary);">${dateStr}</span> &nbsp;&bull;&nbsp; ${timeStr}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ================================================================
    // FEATURE: ESC key closes modal
    // ================================================================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('image-modal');
            if (modal && modal.style.display === 'flex') {
                if (typingTimer) clearTimeout(typingTimer);
                modal.style.display = 'none';
            }
            // Also close notif dropdown
            const notifDropdown = document.getElementById('notif-dropdown');
            if (notifDropdown) notifDropdown.classList.remove('open');
        }
    });


    // ================================================================
    // FEATURE: Sortable Table Columns
    // ================================================================
    let sortCol = null;
    let sortDir = 'asc';

    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.getAttribute('data-col');
            if (sortCol === col) {
                sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortCol = col;
                sortDir = 'asc';
            }
            // Update header indicators
            document.querySelectorAll('th.sortable').forEach(h => {
                h.classList.remove('asc', 'desc');
            });
            th.classList.add(sortDir);
            renderSortedTable();
        });
    });

    function renderSortedTable() {
        // Rebuild filtered + sorted data
        const query = document.getElementById('table-search')?.value || '';
        const filtered = iaData.filter(item => {
            const q = query.toLowerCase().trim();
            const matchSearch = !q ||
                item.cat.toLowerCase().includes(q) ||
                item.tipo.toLowerCase().includes(q) ||
                item.arch.toLowerCase().includes(q) ||
                item.ejemplo.toLowerCase().includes(q) ||
                item.alcance.toLowerCase().includes(q) ||
                item.estado.toLowerCase().includes(q);
            let matchFilter = true;
            if (activeFilter === 'Actual') matchFilter = item.estado === 'Actual';
            else if (activeFilter === 'En Desarrollo') matchFilter = item.estado === 'En Desarrollo';
            else if (activeFilter === 'Teórico/Futuro') matchFilter = item.estado === 'Teórico/Futuro';
            return matchSearch && matchFilter;
        });

        if (sortCol) {
            filtered.sort((a, b) => {
                const valA = (a[sortCol] || '').toLowerCase();
                const valB = (b[sortCol] || '').toLowerCase();
                if (valA < valB) return sortDir === 'asc' ? -1 : 1;
                if (valA > valB) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 2rem;">No se encontraron taxonomías.</td></tr>`;
            return;
        }
        filtered.forEach((item, index) => {
            const tr = document.createElement('tr');
            let badgeClass = 'badge-actual';
            if (item.estado === 'En Desarrollo') badgeClass = 'badge-desarrollo';
            if (item.estado === 'Teórico/Futuro') badgeClass = 'badge-teorico';
            tr.style.animation = `slideInUp 0.4s ease forwards ${index * 0.05}s`;
            tr.style.opacity = '0';
            tr.innerHTML = `
                <td style="font-weight: 600;">${item.cat}</td>
                <td style="color: var(--secondary); font-weight: 500;">${item.tipo}</td>
                <td style="font-family: monospace; font-size: 0.85rem; color: #a78bfa;">${item.arch}</td>
                <td>${item.ejemplo}</td>
                <td style="color: var(--text-dim); font-size: 0.875rem;">${item.alcance}</td>
                <td><span class="badge ${badgeClass}">${item.estado}</span></td>
            `;
            tr.addEventListener('click', () => {
                document.querySelectorAll('#table-body tr').forEach(r => r.classList.remove('selected'));
                tr.classList.add('selected');
            });
            tbody.appendChild(tr);
        });
    }

    // ================================================================
    // FEATURE: Neural Network Canvas on Login
    // ================================================================
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
        // MOBILE PERFORMANCE FIX: Skip heavy canvas animation on small screens
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            // On mobile, hide canvas entirely to prevent GPU overload
            canvas.style.display = 'none';
        } else {
            const ctx = canvas.getContext('2d');
            let particles = [];
            // Reduced particle count for better performance
            const PARTICLE_COUNT = 35;
            const MAX_DIST = 120;
            let animFrameId = null;

            function resizeCanvas() {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            }
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    r: Math.random() * 2 + 1
                });
            }

            function drawNeural() {
                const loginScreen = document.getElementById('login-screen');
                // Stop animation completely when logged in to save memory/GPU
                if (loginScreen && loginScreen.style.display === 'none') return;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw connections
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        // Use squared distance to avoid expensive sqrt when possible
                        const distSq = dx * dx + dy * dy;
                        const maxDistSq = MAX_DIST * MAX_DIST;
                        if (distSq < maxDistSq) {
                            const dist = Math.sqrt(distSq);
                            const alpha = (1 - dist / MAX_DIST) * 0.4;
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
                            ctx.lineWidth = 0.7;
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.stroke();
                        }
                    }
                }

                // Draw nodes
                particles.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
                    ctx.fill();

                    // Move
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                });

                animFrameId = requestAnimationFrame(drawNeural);
            }
            drawNeural();
        }
    }

    // ================================================================
    // FEATURE: Reading Progress Bar (tracks content-area scroll)
    // ================================================================
    const progressBar = document.getElementById('reading-progress');
    const contentArea = document.querySelector('.content-area');
    if (progressBar && contentArea) {
        // We'll update it based on which page's scroll container is active
        function updateReadingProgress() {
            const activePage = document.querySelector('.page.active');
            if (!activePage) { progressBar.style.width = '0%'; return; }
            const scrollable = activePage.querySelector('.scroll-container') ||
                               activePage.querySelector('.gallery-grid') ||
                               activePage;
            const scrollTop = scrollable.scrollTop || 0;
            const scrollHeight = scrollable.scrollHeight - scrollable.clientHeight;
            const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            progressBar.style.width = `${Math.min(pct, 100)}%`;
        }

        // Attach scroll listeners to all scrollable containers
        document.querySelectorAll('.scroll-container, .gallery-grid').forEach(el => {
            el.addEventListener('scroll', updateReadingProgress);
        });
    }

    // ================================================================
    // FEATURE: Sidebar tooltip data-tooltip attributes
    // ================================================================
    const tooltipMap = {
        'historia': 'Historia',
        'clasificacion': 'Clasificación',
        'caracteristicas': 'Características',
        'galeria': 'Galería',
        'multimedia': 'Multimedia'
    };
    document.querySelectorAll('.menu-btn[data-page]').forEach(btn => {
        const page = btn.getAttribute('data-page');
        if (tooltipMap[page]) btn.setAttribute('data-tooltip', tooltipMap[page]);
    });

    // ================================================================
    // FEATURE: Multimedia Cinema Mode
    // ================================================================
    const cinemaModal = document.getElementById('cinema-modal');
    const cinemaIframe = document.getElementById('cinema-iframe');
    const cinemaClose = document.getElementById('cinema-close-btn');

    document.querySelectorAll('.custom-player').forEach(player => {
        player.addEventListener('click', () => {
            const videoId = player.getAttribute('data-video-id');
            const title = player.querySelector('h4').textContent;
            
            if (videoId && cinemaModal && cinemaIframe) {
                showToast(`Iniciando modo cine: ${title}`, 'success');
                // Construct embed URL with autoplay, handle if videoId already has query params
                const separator = videoId.includes('?') ? '&' : '?';
                cinemaIframe.src = `https://www.youtube.com/embed/${videoId}${separator}autoplay=1&rel=0`;
                
                cinemaModal.style.display = 'flex';
                // Add tiny animation to show it smoothly
                cinemaModal.style.opacity = '0';
                setTimeout(() => {
                    cinemaModal.style.transition = 'opacity 0.3s ease';
                    cinemaModal.style.opacity = '1';
                }, 10);
            }
        });
    });

    if (cinemaClose && cinemaModal && cinemaIframe) {
        cinemaClose.addEventListener('click', () => {
            cinemaModal.style.opacity = '0';
            setTimeout(() => {
                cinemaModal.style.display = 'none';
                cinemaIframe.src = ''; // Stop video
            }, 300);
        });
    }

    // Also close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cinemaModal && cinemaModal.style.display === 'flex') {
            cinemaClose.click();
        }
    });

});
