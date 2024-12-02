document.addEventListener("DOMContentLoaded", () => {
    // Slideshow Automático
    let slideIndex = 0;

    function showSlides() {
        let slides = document.getElementsByClassName("slide");

        // Esconde todas as imagens
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }

        slideIndex++;
        if (slideIndex > slides.length) {
            slideIndex = 1;
        }
        slides[slideIndex - 1].style.display = "block"; // Mostra a imagem atual

        setTimeout(showSlides, 3000); // Muda a imagem a cada 3 segundos
    }

    showSlides(); // Inicia o slideshow

    // Efeito de Movimento do Mouse no Fundo (Parallax)
    const homeSection = document.querySelector('.home');

    if (homeSection) {
        homeSection.addEventListener('mousemove', function (e) {
            const moveX = (e.clientX - window.innerWidth / 2) / 10;
            const moveY = (e.clientY - window.innerHeight / 2) / 20;
            this.style.backgroundPosition = `${moveX}px ${moveY}px`;
        });
    }

    // Animação de Skills (Círculo de Progresso)
    const skills = document.querySelectorAll('.skill');

    skills.forEach(skill => {
        const percentage = skill.getAttribute('data-percentage');
        const progressCircle = skill.querySelector('.progress-circle');
        const percentageText = skill.querySelector('.percentage');
        const radius = progressCircle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;

        // Configuração inicial
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference;

        // Animação do progresso
        let currentPercentage = 0;
        const animate = setInterval(() => {
            if (currentPercentage >= percentage) {
                clearInterval(animate);
            } else {
                currentPercentage++;
                const offset = circumference - (currentPercentage / 100) * circumference;
                progressCircle.style.strokeDashoffset = offset;
                percentageText.textContent = `${currentPercentage}%`;
            }
        }, 15); // Velocidade da animação
    });

    // Scroll Suave e Destaque de Seção Ativa
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 80; // Compensa altura da navbar
            const sectionHeight = section.offsetHeight;

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach((link) => link.classList.remove('active'));
                const activeLink = document.querySelector(
                    `.nav-links a[href="#${section.id}"]`
                );
                if (activeLink) activeLink.classList.add('active');
            }
        });
    });

    // Scroll Suave ao Clicar nos Links
    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            // Fechar o menu se estiver no modo mobile
            if (window.innerWidth <= 768) {
                navLinksContainer.classList.remove('active');
            }

            window.scrollTo({
                top: targetSection.offsetTop - 70,
                behavior: 'smooth',
            });
        });
    });

    // Toggle de Menu para dispositivos móveis
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links'); // Para alternar visibilidade dos links

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active'); // Abre/fecha o menu
        });
    }

    // Fechar o menu automaticamente quando a largura da tela for maior que 768px
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navLinksContainer.classList.remove('active'); // Fecha o menu em telas grandes
        }
    });

    // Remover a classe 'active' de "Home" ao carregar a página
    window.addEventListener('load', () => {
        navLinks.forEach((link) => {
            if (link.getAttribute('href') === '#home') {
                link.classList.remove('active');
            }
        });
    });

});
