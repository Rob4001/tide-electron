<template>
  <div class="file" v-on:drop="fileDropped" v-on:contextmenu="openMenu">
    <div
        class="file-row"
        v-bind:class="{'is-folder': isFolder, 'folder-open': folderOpen, 'selected': selected}"
        v-on:click="fileclicked">
      <span
          class="file-disclosure-triangle"
          v-bind:style="{ visibility: isFolder }"
          v-bind:class="{'folder-open': folderOpen}"
          v-on:click="toggleFolderOpen"></span>
      <span class="file-icon file-icon-{{file.type}}"></span>
      <span class="file-name" v-show="!renaming">
        {{file.name}}
      </span>
      <input class="file-name-editor" type="text" v-show="renaming" value="{{file.name}}" @keyup.enter="rename" @keyup.esc="cancelRename">
    </div>
    <ul class="filetree" v-if="isFolder" v-show="folderOpen">
      <template v-for="child in file.files">
        <file :file="child"></file>
      </template>
    </ul>
  </div>
</template>

<script>
  import {TingappFolder} from '../tingapp.js';
  import {remote} from 'electron';
  const {Menu,MenuItem,dialog} =  remote;

  function generateFileMenu(component){
    var file = component.file;
    var fileMenu = new Menu();
    fileMenu.append(new MenuItem({
      label: 'New File',
      click: function(evt) {
          file.newFile("NewFile.py");
      }
    }));

    fileMenu.append(new MenuItem({
      label: 'New Folder',
      click: function(evt) {
        file.newFolder("NewFolder");
      }
    }));
    fileMenu.append(new MenuItem({
      label: 'Import File',
      click: function(evt) {
        dialog.showOpenDialog({properties:['openFile']},function(files){
          for(var i in files){
            file.addFile(files[i]);
          }
        });
      }
    }));
    fileMenu.append(new MenuItem({
      type: 'separator'
    }));

    fileMenu.append(new MenuItem({
      label: 'Rename',
      click: function(evt) {
          component.renaming = true;
      }
    }));

    fileMenu.append(new MenuItem({
      label: 'Delete',
      click: function(evt) {
          //TODO: Implement
      }
    }));
    return fileMenu;
  }



  export default {
    name: 'file',
    props: ['file'],
    data: function () {
      return {
        folderOpen: false,
        selected: false,
        renaming: false,
      };
    },
    methods: {
      toggleFolderOpen: function (event) {
        this.folderOpen = !this.folderOpen;
        event.stopPropagation();
      },
      fileclicked: function(event){
        if (this.isFolder) {
          this.toggleFolderOpen(event);
        } else {
          this.$dispatch('fileClicked', this.file);
          event.stopPropagation();
        }
      },
      fileDropped: function(event){
        event.preventDefault();
        event.stopPropagation();
        var file = event.dataTransfer.files[0];
        console.log('File you dragged here is', file.path, "dropped on", this.file.path);

        this.file.addFile(file.path);

        return false;
      },
      openMenu: function(event){
        event.preventDefault();
        event.stopPropagation();
        this.fileMenu.popup(remote.getCurrentWindow());
      },
      rename: function(event){
        this.file.rename(event.target.value);
        this.$destroy();
      },
      cancelRename: function(event){
        this.renaming = false;
      }
    },
    events: {
      openFile: function(file) {
        let isThisFile = (file == this.file);

        this.selected = isThisFile;

        return true;
      }
    },
    computed: {
      isFolder: function () {
        return (this.file.type == 'folder');
      },
      fileMenu: function(){
        return generateFileMenu(this);
      }
    }
  }
</script>
