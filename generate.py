import os
import re
import shutil
import xml.etree.ElementTree as ET
from datetime import datetime
from xml.dom import minidom
from PIL import Image
from concurrent.futures import ThreadPoolExecutor

ARTICLE_PATH = "/Users/tugdual/Documents/Notes/Articles/"
LINK_ATTRS = """onclick="window.open(`%s`, '_blank');" style="cursor: pointer;\""""

PLACEHOLDER_IMG = "data:image/svg+xml,%%3Csvg xmlns='http://www.w3.org/2000/svg' width='%s' height='%s'%%3E%%3Crect width='100%%25' height='100%%25' fill='%%23f0f0f0'/%%3E%%3C/svg%%3E"

PROJECT_CARD_TEMPLATE = """
<div class="project-card">
  <div class="project-header">
    <img class="project-icon lazy" %s data-src="%s" src="%s" width="48" height="48" alt="icon" loading="lazy">
    <h2 class="project-title">%s</h2>
  </div>
  <div class="project-image-container">
    <img class="project-image lazy" %s data-src="%s" src="%s" width="220" height="140" alt="project image" loading="lazy">
  </div>
  <div class="project-desc-container">
    <p class="project-desc" %s>%s</p>
  </div>
</div>"""

GIF_TEMPLATE = '<div class="hitbox2"><img src="images/%s" style="display:block;margin:auto;height:50%%"></div>'

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <link rel="icon" href="logo.svg" type="image/svg+xml">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes, maximum-scale=5.0">
    <meta name="description" content="Tugdual Kerjan - MSc CS EPFL, poking around life! Projects, innovations, and learning by building.">
    <meta name="theme-color" content="#ff7a00">
    <title>TUGDUAL</title>
    <link rel="stylesheet" href="index.css">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Inter:wght@400;600&family=DM+Serif+Display:ital,wght@0,400;1,400&family=IBM+Plex+Sans:wght@400;700&family=Space+Grotesk:wght@400;700&family=Pacifico&display=swap" rel="stylesheet">
    <link rel="preload" href="me.png" as="image" type="image/png">
    <script src="vanilla-tilt.min.js"></script>
    <script
    src="https://app.rybbit.io/api/script.js"
    data-site-id="1210"
    defer
    ></script>
    <style>
    .draw-animate path, .draw-animate line {
        stroke-dasharray: 1000;
        stroke-dashoffset: 1000;
        animation: draw 2s forwards;
    }
    @keyframes draw {
        to { stroke-dashoffset: 0; }
    }
    /* Touch improvements for mobile devices */
    @media (hover: none) and (pointer: coarse) {
        .project-card:hover {
            transform: none;
            box-shadow: 0 6px 32px 0 #ff7a0022, 0 1.5px 0 0 #fff inset;
        }
        .contact-link:hover, .lang-switch span:hover {
            transform: none;
        }
        .logo:hover {
            transform: none;
            filter: none;
        }
    }
    </style>
    <script>
    // Reveal animations on scroll and logo animation
    document.addEventListener('DOMContentLoaded', function() {
      function revealOnScroll() {
        document.querySelectorAll('.fade-in, .slide-up, .hero-paper-img, .projects-title, .hero-paper-title').forEach(function(el) {
          var rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight - 60) {
            el.classList.add('visible');
          }
        });
      }
      window.addEventListener('scroll', revealOnScroll);
      revealOnScroll();
      // Animate logo on load
      var logo = document.querySelector('.logo-svg');
      if (logo) setTimeout(() => logo.classList.add('animated'), 400);
      // Header shrink on scroll
      var header = document.querySelector('.landing-header');
      function handleHeaderShrink() {
        if (window.scrollY > 10) {
          header.classList.add('shrink');
        } else {
          header.classList.remove('shrink');
        }
      }
      window.addEventListener('scroll', handleHeaderShrink);
      handleHeaderShrink();
    });
    </script>
</head>

<body>
    <div class="paper-bg"></div>
    <header class="landing-header sticky-header fade-in">
    <div class="logo">
        <a href="https://tugdual.fr" style="cursor: pointer;">
            <img src="logo.svg" alt="Tugdual Logo" class="logo-svg" />
        </a>
    </div>
    <nav>
        <div class="header-contacts">
            <a href="mailto:tkerjan@outlook.com" title="Email" class="contact-link trans fade-in" data-en="EMAIL &rarr;" data-fr="EMAIL &rarr;">EMAIL &rarr;</a>
            <a href="https://t.me/sxyBoi" title="Telegram" class="contact-link trans fade-in" data-en="TELEGRAM &rarr;" data-fr="TÉLÉGRAM &rarr;">TELEGRAM &rarr;</a>
            <a href="https://tugdual.fr/rss.xml" title="RSS" class="contact-link trans fade-in" data-en="RSS &rarr;" data-fr="RSS &rarr;">RSS &rarr;</a>
        </div>
        <div class="lang-switch nav-lang fade-in" id="lang-switch"><span id="en-btn" class="active">EN</span> <span id="fr-btn">FR</span></div>
    </nav>
    </header>
    <main class="landing-main">
        <section class="hero-paper slide-up">
            <div class="hero-paper-imgwrap">
                <img src="me.png" alt="Tugdual" class="hero-paper-img" width="320" height="320" loading="eager">
            </div>
            <div class="hero-paper-content">
                <h1 class="hero-paper-title trans"
    data-en="Hi, I'm <img class='hero-signature-svg' src='tugdual.svg' alt='signature' style='transform:scale(2); display:inline-block; vertical-align:middle; transform-origin:left center; margin-left:8px;'/><br>I love to learn by building."
    data-fr="Salut, je suis <img class='hero-signature-svg' src='tugdual.svg' alt='signature' style='transform:scale(2); display:inline-block; vertical-align:middle; transform-origin:left center; margin-left:8px;'/><br>J'adore apprendre en construisant."
    >
    Hi, I'm <img class='hero-signature-svg' src='tugdual.svg' alt='signature' style='transform:scale(2); display:inline-block; vertical-align:middle; transform-origin:left center; margin-left:8px;'/><br>I love to learn by building.
</h1>
            <p class="hero-paper-desc trans fade-in" data-en="I've studied computer architecture at EPFL, and now work in my own company, <a href='https://tugdual.fr/gradient' target='_blank'>Gradient Kerjan</a>." data-fr="J'ai étudié l'architecture des ordinateurs à l'EPFL, et je travaille maintenant en tant qu'indépendant dans ma boîte, <a href='https://tugdual.fr/gradient' target='_blank'>Gradient Kerjan</a>">I've studied computer architecture at EPFL, and now work in my own company, <a href='https://tugdual.fr/gradient' target='_blank'>Gradient Kerjan</a>.</p>                <div class="hero-paper-socials" style="display:none;"></div>
            </div>
        </section>
        <section class="status-section fade-in">
          <h2 class="projects-title trans" data-en="Status" data-fr="Statut">Status</h2>
          <div class="status-row">
            <div class="status-block">
              <div class="status-label-wrap">
                <div class="status-label">Currently working on</div>
                <div class="status-arrow">
                  <svg width="80" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40 10 Q20 40 80 55" stroke="#ff7a00" stroke-width="4" fill="none" marker-end="url(#arrowhead2)"/><defs><marker id="arrowhead2" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,4 L0,8 L2,4 L0,0" fill="#ff7a00"/></marker></defs></svg>
                </div>
              </div>
              <div class="status-value" id="current-status"></div>
            </div>
            <div class="status-block">
            <div class="status-label-wrap">
              <div class="status-label">Services I pay for</div>
                <div class="status-arrow">
                  <svg width="80" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40 10 Q20 40 80 55" stroke="#ff7a00" stroke-width="4" fill="none" marker-end="url(#arrowhead2)"/><defs><marker id="arrowhead2" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,4 L0,8 L2,4 L0,0" fill="#ff7a00"/></marker></defs></svg>
                </div>
              </div>
              <ul class="services-list">
                <li><a href="https://telegram.org/premium" target="_blank" rel="noopener">Telegram Premium</a></li>
                <li><a href="https://claude.ai" target="_blank" rel="noopener">Claude Pro</a></li>
                <li><a href="https://pasteapp.io/" target="_blank" rel="noopener">Paste on mac</a></li>
                <li><a href="https://www.warmshowers.org/" target="_blank" rel="noopener">Warmshowers</a></li>
                <li><a href="https://www.odoo.com/" target="_blank" rel="noopener">Odoo</a></li>
                <li><a href="https://kagi.com/" target="_blank" rel="noopener">Kagi Search</a></li>
              </ul>
            </div>
          </div>
        </section>
        <script>
        document.getElementById('current-status').textContent = 'List of artifacts'; // Change as needed
        </script>
        <section id="projects" class="projects-section fade-in">
            <h2 class="projects-title trans" data-en="Projects completed" data-fr="Projets complétées">Projects completed</h2>
            <div class="projects-list">
                %s
            </div>
        </section>
    </main>
    <footer class="landing-footer">
        <div class="landing-bottom-bar"></div>
    </footer>
    <script>
    // Vanilla JS hover animations - REMOVED, now handled by CSS
    document.addEventListener('DOMContentLoaded', function() {
        // Lazy loading implementation
        const lazyImages = document.querySelectorAll('img.lazy');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });

        // Language switcher
        function setLang(lang) {
            document.querySelectorAll('.trans').forEach(function(el) {
                el.innerHTML = el.getAttribute('data-' + lang);
            });
            document.getElementById('en-btn').classList.toggle('active', lang === 'en');
            document.getElementById('fr-btn').classList.toggle('active', lang === 'fr');
        }
        document.getElementById('en-btn').onclick = function() { setLang('en'); };
        document.getElementById('fr-btn').onclick = function() { setLang('fr'); };
    });

    // SVG signature unveil animation
    window.addEventListener('DOMContentLoaded', function() {
        var svg = document.getElementById('signature-svg');
        if (svg) {
            var totalLength = 0;
            svg.querySelectorAll('line').forEach(function(line) {
                var x1 = parseFloat(line.getAttribute('x1'));
                var y1 = parseFloat(line.getAttribute('y1'));
                var x2 = parseFloat(line.getAttribute('x2'));
                var y2 = parseFloat(line.getAttribute('y2'));
                var length = Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
                line.setAttribute('stroke-dasharray', length);
                line.setAttribute('stroke-dashoffset', length);
                totalLength += length;
            });
            var lines = svg.querySelectorAll('line');
            lines.forEach(function(line, i) {
                setTimeout(function() {
                    line.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.77,0,0.18,1)';
                    line.setAttribute('stroke-dashoffset', 0);
                }, i * 250);
            });
        }
    });

    // Inline SVG animation for logo.svg and tugdual.svg
    function inlineSVG(imgSelector) {
        document.querySelectorAll(imgSelector).forEach(function(img) {
            fetch(img.src)
                .then(res => res.text())
                .then(svgText => {
                    const div = document.createElement('div');
                    div.innerHTML = svgText;
                    const svg = div.querySelector('svg');
                    if (!svg) return;
                    svg.classList.add('draw-animate');
                    // Remove width/height to allow CSS scaling
                    svg.removeAttribute('width');
                    svg.removeAttribute('height');
                    // Copy over class and style from img
                    if (img.className) svg.setAttribute('class', img.className + ' draw-animate');
                    if (img.style.cssText) svg.setAttribute('style', img.style.cssText);
                    img.replaceWith(svg);
                    // Animate each path/line
                    svg.querySelectorAll('path, line').forEach(function(el) {
                        let length;
                        if (el.tagName === 'path') {
                            length = el.getTotalLength();
                        } else if (el.tagName === 'line') {
                            const x1 = el.x1.baseVal.value, y1 = el.y1.baseVal.value;
                            const x2 = el.x2.baseVal.value, y2 = el.y2.baseVal.value;
                            length = Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
                        }
                        el.style.strokeDasharray = length;
                        el.style.strokeDashoffset = length;
                        el.style.animation = 'draw 2s forwards';
                    });
                });
        });
    }
    document.addEventListener('DOMContentLoaded', function() {
        inlineSVG('img.hero-signature-svg');
    });
    </script>
</body>

</html>
            """


def get_image_filename(img_line):
    """Extract filename from markdown image line"""
    return img_line[4:-2]


def get_webp_path(img_name):
    """Convert image name to webp path or keep gif as is"""
    return (
        img_name
        if img_name.lower().endswith(".gif")
        else f"{os.path.splitext(img_name)[0]}.webp"
    )


def transform_text(lines) -> str:
    """Transform article text to HTML project card"""
    title_line = lines[0].strip()
    card_image = get_webp_path(get_image_filename(lines[1]))
    description = lines[3].strip()
    back_image = get_webp_path(get_image_filename(lines[-1]))

    icon_placeholder = PLACEHOLDER_IMG % ("48", "48")
    img_placeholder = PLACEHOLDER_IMG % ("220", "140")

    if "[" in title_line:  # Has link
        title = title_line.split("# [")[1].split("](")[0]
        link = title_line.split("](")[1][:-1]
        link_attrs = LINK_ATTRS % link
        return PROJECT_CARD_TEMPLATE % (
            link_attrs,
            card_image,
            icon_placeholder,
            title,
            link_attrs,
            back_image,
            img_placeholder,
            link_attrs,
            description,
        )
    else:  # No link
        title = title_line.split("# ")[1]
        return PROJECT_CARD_TEMPLATE % (
            "",
            card_image,
            icon_placeholder,
            title,
            "",
            back_image,
            img_placeholder,
            "",
            description,
        )


def get_article_files(path):
    """Get filtered list of article files"""
    return [f for f in os.listdir(path) if f not in ("images", ".DS_Store")]


def extract_article_data(lines):
    """Extract title, link, and description from article lines"""
    if len(lines) < 4:
        return None, None, None

    title_line = lines[0].strip()
    if "[" in title_line:
        title = title_line.split("# [")[1].split("](")[0]
        link = title_line.split("](")[1][:-1]
    else:
        title = title_line.split("# ")[1]
        link = ""

    return title, link, lines[3].strip()


def get_pub_date(filename, filepath):
    """Get publication date from filename or file modification time"""
    date_match = re.match(r"(\d{4}-\d{2}-\d{2})", filename)
    if date_match:
        return datetime.strptime(date_match.group(1), "%Y-%m-%d")
    return datetime.fromtimestamp(os.path.getmtime(filepath))


def generate_rss(article_path):
    """Generate RSS feed from articles"""
    rss = ET.Element("rss", version="2.0")
    channel = ET.SubElement(rss, "channel")

    ET.SubElement(channel, "title").text = "TUGDUAL"
    ET.SubElement(channel, "link").text = "https://tugdual.fr"
    ET.SubElement(channel, "description").text = "MSc CS EPFL, poking around life !"

    for filename in sorted(get_article_files(article_path), reverse=True):
        if filename.endswith(".gif"):  # Skip GIFs for RSS
            continue

        filepath = os.path.join(article_path, filename)
        with open(filepath) as f:
            title, link, description = extract_article_data(f.readlines())

        if not title:
            continue

        item = ET.SubElement(channel, "item")
        ET.SubElement(item, "title").text = title
        if link:
            ET.SubElement(item, "link").text = link
        ET.SubElement(item, "description").text = description

        try:
            pub_date = get_pub_date(filename, filepath).strftime(
                "%a, %d %b %Y %H:%M:%S +0000"
            )
        except Exception:
            pub_date = datetime.now().strftime("%a, %d %b %Y %H:%M:%S +0000")

        ET.SubElement(item, "pubDate").text = pub_date
        ET.SubElement(
            item, "guid", isPermaLink="false"
        ).text = f"tugdual-{filename.replace('.', '-')}"

    with open("rss.xml", "w", encoding="utf-8") as f:
        f.write(minidom.parseString(ET.tostring(rss, "utf-8")).toprettyxml(indent="  "))

    print("RSS feed generated successfully")


def generate_sitemap(article_path):
    """Generate sitemap.xml for articles with links"""
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    for filename in sorted(get_article_files(article_path), reverse=True):
        if filename.endswith(".gif"):  # Skip GIFs for sitemap
            continue

        with open(os.path.join(article_path, filename)) as f:
            lines = f.readlines()

        if lines and "[" in lines[0]:
            try:
                link = lines[0].split("](")[1].split(")")[0]
                ET.SubElement(ET.SubElement(urlset, "url"), "loc").text = link
            except (IndexError, ValueError):
                continue

    with open("sitemap.xml", "w", encoding="utf-8") as f:
        f.write(
            minidom.parseString(ET.tostring(urlset, "utf-8")).toprettyxml(indent="  ")
        )

    print("Sitemap generated successfully")


def compress_and_resize_image(src_path, dest_path, max_width=800):
    """Convert images to WebP format with compression. GIFs are copied as-is."""
    if src_path.lower().endswith(".gif"):
        shutil.copy2(src_path, dest_path)
        return

    try:
        with Image.open(src_path) as img:
            # Convert to RGB/RGBA properly
            if img.mode == "P":
                img = img.convert("RGBA" if "transparency" in img.info else "RGB")
            elif img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGB")

            # Resize if needed
            w, h = img.size
            if w > max_width:
                img = img.resize(
                    (max_width, int(h * max_width / w)), Image.Resampling.LANCZOS
                )

            img.save(dest_path, "WEBP", quality=90, method=6)
    except Exception as e:
        print(f"Error processing {src_path}: {e}")
        shutil.copy2(src_path, dest_path)


def process_images(src_dir, dest_dir):
    """Process images from source to destination directory with compression"""
    os.makedirs(dest_dir, exist_ok=True)

    tasks = []
    for fname in os.listdir(src_dir):
        src_path = os.path.join(src_dir, fname)
        dest_ext = ".gif" if fname.lower().endswith(".gif") else ".webp"
        dest_path = os.path.join(dest_dir, os.path.splitext(fname)[0] + dest_ext)

        # Only process if source is newer or dest doesn't exist
        if not os.path.exists(dest_path) or os.path.getmtime(
            src_path
        ) > os.path.getmtime(dest_path):
            tasks.append((src_path, dest_path))

    with ThreadPoolExecutor() as executor:
        for future in executor.map(
            lambda args: compress_and_resize_image(*args), tasks
        ):
            pass  # Process all tasks


def main():
    """Main function to generate website"""
    # Process images
    process_images(os.path.join(ARTICLE_PATH, "images"), "images")

    # Generate project cards
    articles = []
    for filename in sorted(get_article_files(ARTICLE_PATH), reverse=True):
        if filename.endswith(".gif"):
            articles.append(GIF_TEMPLATE % filename[4:])
        else:
            with open(os.path.join(ARTICLE_PATH, filename)) as f:
                print(filename)
                articles.append(transform_text(f.readlines()))

    # Write HTML file
    with open("index.html", "w") as f:
        f.write(HTML_TEMPLATE % "\n".join(articles))

    # Generate feeds
    generate_rss(ARTICLE_PATH)
    generate_sitemap(ARTICLE_PATH)


if __name__ == "__main__":
    main()
