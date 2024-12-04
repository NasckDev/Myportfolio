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
    
    // Slideshow de Projetos
    const projectsWrapper = document.querySelector('.projects-slider-wrapper');
    const nextBtn = document.querySelector('.projects-next-btn');
    const prevBtn = document.querySelector('.projects-prev-btn');

    let currentSlide = 0;

    function showProjectSlide(index) {
        const slides = projectsWrapper.children;
        const totalSlides = slides.length;
        const slideWidth = slides[0].offsetWidth + parseInt(getComputedStyle(projectsWrapper).gap);
        const maxOffset = -(totalSlides - Math.floor(projectsWrapper.offsetWidth / slideWidth)) * slideWidth;

        if (index < 0) {
            currentSlide = 0; // Voltar ao início
        } else if (-index * slideWidth <= maxOffset) {
            currentSlide = -(maxOffset / slideWidth); // Parar no último slide
        } else {
            currentSlide = index;
        }

        const offset = Math.min(0, -currentSlide * slideWidth); // Ajuste para centralizar
        projectsWrapper.style.transform = `translateX(${offset}px)`;
    }

    nextBtn.addEventListener('click', () => {
        showProjectSlide(currentSlide + 1);
    });

    prevBtn.addEventListener('click', () => {
        showProjectSlide(currentSlide - 1);
    });

    // Ajustar slides ao redimensionar
    window.addEventListener('resize', () => showProjectSlide(currentSlide));
});

document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contact-form");
    const formStatus = document.getElementById("form-status");
  
    // Inicializar EmailJS
    emailjs.init("_JHHcmkRsNT6iUer5"); // Substitua pela sua Public Key do EmailJS
  
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Impede o envio padrão do formulário
  
      formStatus.textContent = "Validando...";
  
      // Validar reCAPTCHA
      const recaptchaResponse = document.querySelector(".g-recaptcha-response").value;
  
      if (!recaptchaResponse) {
        formStatus.textContent = "Por favor, confirme que você não é um robô.";
        formStatus.className = "error";
        return;
      }
  
      // Dados do formulário
      const formData = {
        name: contactForm.name.value,
        email: contactForm.email.value,
        message: contactForm.message.value,
        "g-recaptcha-response": recaptchaResponse,
      };
  
      try {
        formStatus.textContent = "Enviando mensagem...";
  
        await emailjs.send("service_gxqkx1a", "template_6aia1al", formData);
  
        formStatus.textContent = "Mensagem enviada com sucesso!";
        formStatus.className = "success";
  
        contactForm.reset(); // Limpa o formulário
        grecaptcha.reset(); // Reseta o reCAPTCHA
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        formStatus.textContent = "Erro ao enviar a mensagem. Tente novamente.";
        formStatus.className = "error";
      }
    });
});
  