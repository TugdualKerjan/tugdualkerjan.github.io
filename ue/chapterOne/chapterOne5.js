var menu = document.getElementById('menu');
var chapters = ['Front', 'Clint', 'Trash']; // Descriptive chapter names

// Function to hide all chapters
function hideAllChapters() {
    chapters.forEach(function (chapter) {
        var section = document.getElementById(chapter.toLowerCase());
        if (section) {
            section.style.display = 'none';
        }
    });
}

// Function to show the selected chapter
function showChapter(chapterName) {
    hideAllChapters();
    var section = document.getElementById(chapterName.toLowerCase());
    if (section) {
        section.style.display = 'block';
    }
}

// Initialize with all chapters hidden, then show the first one
hideAllChapters();
showChapter(chapters[1]);
currentChapter = "clint"

// Add click event listeners to li elements
chapters.forEach(function (chapter) {
    var menuItem = menu.querySelector(`li[data-target="${chapter.toLowerCase()}"]`);
    if (menuItem) {
        menuItem.addEventListener('click', function () {
            showChapter(chapter);
            currentChapter = chapter
        });
    }
});

window.addEventListener('wheel', function(e) {
    // e.preventDefault(); // Prevent the default vertical scroll
    window.scrollBy({
      left: e.deltaY + e.deltaX, // Apply the vertical scroll delta to horizontal scrolling
      behavior: 'smooth'
    });
  }, { passive: false }); // Ensure the default scroll behavior can be prevented
  
