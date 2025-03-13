import os

import re
import xml.etree.ElementTree as ET
from datetime import datetime
from xml.dom import minidom


article_path = "/Users/tugdual/Documents/Notes/Articles/"

link_text = """onclick="window.open(`%s`, '_blank');"
                    style="cursor: pointer;\""""

template = """<div class="hitbox">
    <div class="box">
        <h2 class="name">%s</h2>
        <img class="product" %s src="%s">
        <p class="desc" %s>%s</p>
        <div class="back"><img src="%s"></img></div>
    </div>
</div>"""

template_gif = """<div class="hitbox2">
					<img
						src="images/%s"
						style="
							display: block;
							margin-left: auto;
							margin-right: auto;
							height: 100%%;
						"
					/>
				</div>"""

html_final = """
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <link rel="icon" href="images/toad.gif" type="image/gif">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> T U G D U A L</title>
    <link rel="stylesheet" href="index.css">
    <script src="vanilla-tilt.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"
        integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
</head>

<body>
    <div>
        <div id="background">
        <p id="background-text">TUGDUAL</p>
        <div class="text-container">
            <p id="background-text2">MSc CS EPFL, poking around life !</p>
            <div class="social-icons">
                <a href="https://t.me/sxyBoi" class="social-icon telegram-icon" title="Telegram">
                    <svg viewBox="0 0 24 24">
                        <path d="M9.78,18.65L10.06,14.42L17.74,7.5C18.08,7.19 17.67,7.04 17.22,7.31L7.74,13.3L3.64,12C2.76,11.75 2.75,11.14 3.84,10.7L19.81,4.54C20.54,4.21 21.24,4.72 20.96,5.84L18.24,18.65C18.05,19.56 17.5,19.78 16.74,19.36L12.6,16.3L10.61,18.23C10.38,18.46 10.19,18.65 9.78,18.65Z" />
                    </svg>
                </a>
                <a href="/rss.xml" class="social-icon rss-icon" title="RSS Feed">
                    <svg viewBox="0 0 24 24">
                        <path d="M6.18,15.64A2.18,2.18 0 0,1 8.36,17.82C8.36,19 7.38,20 6.18,20C5,20 4,19 4,17.82A2.18,2.18 0 0,1 6.18,15.64M4,4.44A15.56,15.56 0 0,1 19.56,20H16.73A12.73,12.73 0 0,0 4,7.27V4.44M4,10.1A9.9,9.9 0 0,1 13.9,20H11.07A7.07,7.07 0 0,0 4,12.93V10.1Z" />
                    </svg>
                </a>
                <a href="mailto:tkerjan@outlook.com" class="social-icon email-icon" title="Email">
                    <svg viewBox="0 0 24 24">
                        <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                    </svg>
                </a>
            </div>
        </div>
    </div>
        <div id="container">
            %s
        </div>
    </div>
</body>
<script>
    $('.hitbox').hover(function () {

        $(this).stop().animate({
            height: Math.max($(this).find(".desc").height() + 30 + $(this).find(".product").height(), 200),
        });
    }, function () {
        $(this).stop().animate({
            height: "150px",
        })
    });
</script>
<script src="./index.js"></script>

</html>
            """


def transform_text(text_array) -> str:
    if "[" in text_array[0]:  # Contains link
        title = text_array[0].split("# [")[1].split("](")[0]
        # Get link and remove the last )
        link = text_array[0].split("](")[1][:-2]
        card_image = text_array[1][4:-2]
        card_text = text_array[3][:-1]
        back_image = text_array[-1][4:-1]
        return template % (
            title,
            (link_text % link),
            back_image,
            (link_text % link),
            card_text,
            card_image,
        )
    else:
        title = text_array[0].split("# ")[1][:-1]
        card_image = text_array[1][4:-2]
        card_text = text_array[3][:-1]
        back_image = text_array[-1][4:-1]
        return template % (title, "", back_image, "", card_text, card_image)


def generate_rss(article_path):
    """
    Generate an RSS feed from articles in the specified directory.

    Args:
        article_path (str): Path to directory containing articles
    """
    # Create the root RSS element
    rss = ET.Element("rss", version="2.0")
    channel = ET.SubElement(rss, "channel")

    # Add required channel elements
    ET.SubElement(channel, "title").text = "TUGDUAL"
    ET.SubElement(
        channel, "link"
    ).text = "https://tugdual.com"  # Adjust with your actual website URL
    ET.SubElement(channel, "description").text = "MSc CS EPFL, poking around life !"

    # Get all article files
    file_list = os.listdir(article_path)
    file_list = [
        f
        for f in file_list
        if f != "images" and f != ".DS_Store" and not f.endswith(".gif")
    ]
    file_list.sort(reverse=True)

    # Process each article
    for file_name in file_list:
        with open(os.path.join(article_path, file_name)) as article_file:
            lines = article_file.readlines()

            # Skip if not enough lines
            if len(lines) < 4:
                continue

            # Create item element
            item = ET.SubElement(channel, "item")

            # Extract title and link
            if "[" in lines[0]:  # Contains link
                title = lines[0].split("# [")[1].split("](")[0]
                link = lines[0].split("](")[1][:-2]
            else:
                title = lines[0].split("# ")[1].strip()
                link = ""  # No link available

            # Extract description (card text)
            description = lines[3].strip()

            # Create file date from filename or use last modified time as fallback
            try:
                # Try to extract date from filename (if it follows a pattern like YYYY-MM-DD-title)
                date_match = re.match(r"(\d{4}-\d{2}-\d{2})", file_name)
                if date_match:
                    pub_date = datetime.strptime(date_match.group(1), "%Y-%m-%d")
                else:
                    # Use file modification time as fallback
                    file_path = os.path.join(article_path, file_name)
                    mod_time = os.path.getmtime(file_path)
                    pub_date = datetime.fromtimestamp(mod_time)

                # Format date according to RFC 822
                formatted_date = pub_date.strftime("%a, %d %b %Y %H:%M:%S +0000")
            except Exception:
                # Default to current time if date extraction fails
                formatted_date = datetime.now().strftime("%a, %d %b %Y %H:%M:%S +0000")

            # Add item elements
            ET.SubElement(item, "title").text = title
            if link:
                ET.SubElement(item, "link").text = link
            ET.SubElement(item, "description").text = description
            ET.SubElement(item, "pubDate").text = formatted_date

            # Generate a unique ID based on the title
            guid = ET.SubElement(item, "guid", isPermaLink="false")
            guid.text = f"tugdual-{file_name.replace('.', '-')}"

    # Convert to pretty-printed XML
    rough_string = ET.tostring(rss, "utf-8")
    reparsed = minidom.parseString(rough_string)
    pretty_xml = reparsed.toprettyxml(indent="  ")

    # Write to file
    with open("rss.xml", "w", encoding="utf-8") as f:
        f.write(pretty_xml)

    print("RSS feed generated successfully as rss.xml")


def main():
    file_list = os.listdir(article_path)
    file_list.sort()
    file_list.reverse()
    list_of_articles = []
    for element in file_list:
        if element == "images" or element == ".DS_Store":
            pass
        elif element[-4:] == ".gif":
            list_of_articles.append(template_gif % (element[4:]))
        else:
            with open(article_path + str(element)) as article_file:
                print(element)
                list_of_articles.append(transform_text(article_file.readlines()))
    final_string = html_final % ("\n".join(list_of_articles))
    with open("./index.html", "w") as final_doc:
        final_doc.write(final_string)
        final_doc.close()

    os.system("cp -r %s" % (article_path + "images ."))

    generate_rss(article_path)


if __name__ == "__main__":
    main()
