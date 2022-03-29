import { Component, Inject } from '@angular/core';
import { Archive } from 'libarchive.js/main.js';

import { DOCUMENT } from '@angular/common';

Archive.init({
  workerUrl: 'public/worker-bundle.js',
});

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'angular-archive-project';
  filename: string | undefined;
  filesize: number | undefined;
  filetype: any | undefined;
  password: string = 'password';
  filelist: Array<string> = [];
  filelistToUI: Array<string> = [];
  fileInput: any;
  treeView: any;

  constructor(@Inject(DOCUMENT) document: Document) {
    this.fileInput = document.getElementById("fileInput");
    // this.treeView = document.getElementById("treeView");
  }





  async handleFileInput(event: any) {
    const file = event.currentTarget.files[0];
    this.filename = file.name;
    this.filetype = file.type;
    this.filesize = file.size;

    // const archive = await Archive.open(file);

    // console.log("Is Encrypted : " + await archive.hasEncryptedData());
    // await archive.usePassword("nika")
    // let obj = await archive.extractFiles();
    // console.log(obj);

    await this.getEntries(event);

  }

  async getEntries(event: any) {
    let obj = null, encEntries = false;
    try {
      const file = event.currentTarget.files[0];
      const archive = await Archive.open(file);
      encEntries = await archive.hasEncryptedData();

      console.log("Is Encrypted : " + encEntries);

      await archive.usePassword("nika");

      obj = await archive.extractFiles();
      console.log(obj);

      var div = document.getElementById("treeView");
      while (div.firstChild) {
        div.removeChild(div.firstChild);
      }

      this.walk({
        node: obj,
        liId: "treeView",
        name: file.name,
      });
      this.openFirstFolder();

    } catch (err) {
      console.error(err);
    } finally {
      this.finish()
    }
  }


  walk({ node, liId, name }) {
    const root = document.getElementById(liId);
    if (!(node instanceof File)) {
      const newUlId = this.UUIDv4.generate();
      const newUl = document.createElement("ul");
      newUl.classList.add("nested");
      newUl.id = newUlId;
      const newLi = document.createElement("li");
      root.appendChild(newLi);
      newLi.classList.add("folder");
      newLi.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        newLi.childNodes.forEach((c: HTMLElement) => {

          if (c.classList.contains("nested")) {
            c.classList.toggle("active");
          }

          // console.log(c);

        });
      });
      const span = document.createElement("span");
      span.innerText = name;
      newLi.appendChild(span);
      newLi.appendChild(newUl);
      const keys = Object.keys(node);
      if (keys.length > 0) {
        keys.forEach((key) => {
          this.walk({
            node: node[key],
            liId: newUlId,
            name: key,
          });
        });
      } else {
        const span = document.createElement("span");
        span.innerHTML = "<i>Empty folder</i>";
        root.appendChild(span);
      }
    } else {
      const textarea = document.getElementById("fileOutput");
      const li = document.createElement("li");
      li.innerText = node.name;
      li.addEventListener("click", (e) => {
        e.stopPropagation();
        const reader = new FileReader();
        reader.onload = function (event) {
          if (isASCII(event.target.result)) {
            textarea.textContent = event.target.result as string;
            // downloadable = node.name;
          } else {
            textarea.textContent = "Sorry, we cannot display binary files";
            // downloadable = false;
          }
        };
        reader.readAsText(node);
      });
      root.appendChild(li);
    }
  }

  finish() {
    const d = document.createElement("div");
    d.setAttribute("id", "done");
    d.textContent = "Done.";
    document.body.removeChild(d);
    document.body.appendChild(d);
  }

  openFirstFolder() {
    const treeV = document.getElementById("treeView");
    const firstFolder: HTMLElement = treeV.querySelector(".folder");
    // firstFolder.click();
  }

  isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
  }

  UUIDv4 = new (function () {
    function generateNumber(limit) {
      var value = limit * Math.random();
      return value | 0;
    }

    function generateX() {
      var value = generateNumber(16);
      return value.toString(16);
    }

    function generateXes(count) {
      var result = "";
      for (var i = 0; i < count; ++i) {
        result += generateX();
      }
      return result;
    }

    function generateVariant() {
      var value = generateNumber(16);
      var variant = (value & 0x3) | 0x8;
      return variant.toString(16);
    }

    this.generate = function () {
      var result =
        generateXes(8) +
        "-" +
        generateXes(4) +
        "-" +
        "4" +
        generateXes(3) +
        "-" +
        generateVariant() +
        generateXes(3) +
        "-" +
        generateXes(12);
      return result;
    };
  })();

}


function isASCII(str) {
  return /^[\x00-\x7F]*$/.test(str);
}

