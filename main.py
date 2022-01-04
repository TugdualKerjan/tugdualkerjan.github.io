from bs4 import BeautifulSoup as bs
import pprint as pp

with open("./index.html") as fp:
    soup = bs(fp, 'html.parser')
    inte = 21
    for article in soup.find_all('div', {'class' : 'hitbox'}):
        name = article.find("h2").get_text()
        image = article.find_all("div", {'class' : 'back'})[0].find("img")["src"]
        image2 = article.find("img", {'class' : 'product'})['src']
        text = article.find("a").get_text().replace('\n', ' ').replace("                            ", "")
        f = open("../../../../Notes/Notes/Articles/%03d_%s.md" % (inte, name.lower().replace(" ", "_")), "x")
        if article.has_attr("onclick"):
            link = article["onclick"][13:-13]
            f.write("# [%s](%s)\n" % (name, link))
        else:
            f.write("# %s\n" % (name))
        f.write(("![](%s)\n\n") % (image))
        f.write(text + "\n\n")
        f.write("![](%s)" % (image2))
        f.close()
        inte = inte -1