function navSlide() {
    const burger = document.querySelector(".burger");
    const nav = document.querySelector(".nav-links");
    const navLinks = document.querySelectorAll(".nav-links li");
    
    burger.addEventListener("click", () => {
        //Toggle Nav
        nav.classList.toggle("nav-active");
        //Burger Animation
        burger.classList.toggle("toggle");
    });
    
}

navSlide();

// Show menu function
function showmenu(){
  document.getElementById("navbar").style.display="flex";
  document.getElementById("hide").style.display="block";
  document.getElementById("show").style.display="none";
}

// Hide menu function
function hidemenu(){
  document.getElementById("navbar").style.display="none";
  document.getElementById("hide").style.display="none";
  document.getElementById("show").style.display="block";
}

// Add animation to logo text letters
function animateLogoText() {
    const letters = document.querySelectorAll('.logo-text .letter');
    if (letters.length > 0) {
        letters.forEach(letter => {
            letter.style.animationPlayState = 'running';
        });
    }
}

// Run the animation when the page loads
document.addEventListener('DOMContentLoaded', function() {
    animateLogoText();
});

var prevScrollpos = window.scrollY;
window.onscroll = function() {
  var currentScrollPos = window.pageYOffset;
  if (prevScrollpos > currentScrollPos) {
    document.getElementById("header").style.top = "0";
  } else {
    document.getElementById("header").style.top = "-100px";
  }
  prevScrollpos = currentScrollPos;
}