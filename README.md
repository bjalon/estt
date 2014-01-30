Ecole Sainte Thérèse - Le Mans
====

This repository contains projects produced during my freetime for my children's school.

First project is a Library management for infant school/elementary school.

This project is totally free to use. Feel free to give me feedback. Thanks to Lise Kemen to help me on this project as my CSS Skills are so awful.

===

To Start using it :

* Download Nuxeo 5.8 distribution (see doc.nuxeo.com > Installation)
* Copy studio-production/gestion-bibliotheque-ecole-sainte-therese.jar file in $NUXEO_HOME/nxserver/bundles
* Build this 2 following project and copy jar produced into $NUXEO_HOME/nxserver/bundles
* Start your server
* Go to localhost:8080/nuxeo
* Create several books
* Go into each Book and click on the checkbox (now Book is available)
* Go into yourservernameorip:8080/nuxeo/site/init to import picture of the book from your phone
* And now you can go into yourservernameorip:8080/nuxeo/site/front to use the application.

===
To test the front without installing Nuxeo (need python installed on your desktop):

* Install [maven](http://maven.apache.org/download.cgi)
* Download this project as [zip](https://github.com/bjalon/estt/archive/master.zip) (or clone it)
* Unzip it
* Open a terminal into the $UNZIPPED_SOURCE/nuxeo-est-we-front/src/main/yo
* Start maven : `mvn install`
* launch `python -m SimpleHTTPServer 8888`
* Open your browser to [http://localhost:8888/app](http://localhost:8888/app)

Data you can play with :
- Ref Book : use 005 => book not borrowed
- Ref Book : use 006 => book not borrowed by Administrator
- Ref User : Administrator => picture and metadata available

===

20140120 : First commit - nothing is working yet
20140128 : Now Application initialization works, Picture importer works and borrow works

