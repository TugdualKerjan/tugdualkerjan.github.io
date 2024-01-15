    var menu = document.getElementById('menu');
    var chapters = ['Menu', 'Chapter 1', 'Chapter 2']; // Add more chapters as needed

    // Function to hide all chapters
    function hideAllChapters() {
        chapters.forEach(function (_, index) {
            var section = document.getElementById('chapter' + (index));
            if (section) {
                section.style.display = 'none';
            }
        });
    }

    // Function to show the selected chapter
    function showChapter(index) {
        hideAllChapters();
        var section = document.getElementById('chapter' + index);
        if (section) {
            section.style.display = 'block';
        }
    }

    // Initialize with all chapters hidden
    hideAllChapters();
    showChapter(1);

    // Add menu items and event listeners
    chapters.forEach(function (chapter, index) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.textContent = chapter;
        a.href = 'javascript:void(0)';
        a.onclick = function () { showChapter(index); };
        li.appendChild(a);
        menu.appendChild(li);
    });