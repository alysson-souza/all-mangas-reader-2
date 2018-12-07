<!-- This component is a dialog helper to display simple messages
  - confirm to open a confirmation dialog
  - open to open alert dialog
  - open to open custom dialog, changing buttons, calback on button click attribute can change the message or title
-->

<template>
  <v-dialog :persistent="options.persistent" v-model="dialog" 
    :max-width="options.width" @keydown.esc="options.persistent ? () => {} : cancel()" 
    v-bind:style="{ zIndex: options.zIndex }">
    <v-card>
      <v-toolbar dark :color="options.color" dense flat v-show="!!title">
        <v-toolbar-title class="white--text">{{ title }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text v-show="!!message" text-no-wrap :class="{'text-xs-center' : options.center}">
        <span v-html="messageHtml"></span>
      </v-card-text>
      <v-card-actions class="pt-0" v-show="options.buttons.length > 0 || options.cancel">
        <v-spacer></v-spacer>
        <v-btn v-if="options.cancel" color="grey" flat="flat" @click.native="cancel">
          {{i18n("button_cancel")}}
        </v-btn>
        <v-btn v-for="(but, i) in options.buttons" :key="i" 
          :color="but.color || 'grey'" flat="flat" 
          @click.native="clickButton(but)">
          {{but.title}}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import {i18n, i18nmixin} from "../mixins/i18n-mixin";

  const default_options = {
          color: 'primary',
          width: 500,
          zIndex: 200,
          cancel: false, // display a cancel button
          persistent: false, // persist the dialog, can't close it without clicking one of the actions
          center: false, // center the message
          important: false, // if true and another popup comes, prevent the second one from being displayed
          buttons: [ // list of buttons (except cancel) displayed
          {
            title: i18n("button_close"), 
            color: "grey", 
            click: ({ agree }) => agree()
          }
        ]
      }
  export default {
    mixins: [i18nmixin],
    data() {
      return {
        dialog: false,
        resolve: null,
        reject: null,
        message: null,
        title: null,
        options: default_options
      }
    },
    computed: {
      /* Format markdown to html... not real markdown, just support bold (**text**), italic (_text_), lists, all line breaks are taken into account */
      messageHtml() {
        if (!this.message) return ""
      
        let formatText = txt => {
          let boldify = (text => {
              var bold = /\*\*(\S(.*?\S)?)\*\*/gm;
              var html = text.replace(bold, '<strong>$1</strong>');     
              return html;
          })
          let italicify = (text => { 
              var italic = /_(\S(.*?\S)?)_/gm;
              var html = text.replace(italic, '<i>$1</i>');            
              return html;
          })
          return boldify(italicify(txt))
        }

        let lines = this.message.split("\n")
        let res = "", ulopened = false
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i]
          if (line.trim().indexOf("* ") === 0) { // list item
            if (!ulopened) {
              res += "<p><ul>"
              ulopened = true
            }
            res += "<li>" + formatText(line.substr(2)) + "</li>"
          }
          else {
            if (ulopened) {
              res += "</ul></p>"
              ulopened = false
            }
            res += "<p" + (i === lines.length - 1 ? " style='margin-bottom: 0px'" : "") + ">" + formatText(line) + "</p>"
          }
        }
        if (ulopened) {
          res += "</ul></p>"
        }
        return res
      }
    },
    methods: {
      /** An action button is clicked */
      clickButton(but) {
        but.click({ 
          agree: this.agree, 
          cancel: this.cancel, 
          changeMessage: this.changeMessage, 
          changeTitle: this.changeTitle
        })
      },
      /** Callback of the click attribute on buttons to change message content */
      changeMessage(nMess) {
        this.message = nMess
      },
      /** Callback of the click attribute on buttons to change title content */
      changeTitle(nTit) {
        this.title = nTit
      },
      /** Open a yesno dialog */
      yesno(title, message, options) {
        options = Object.assign(Object.assign({}, default_options), options)
        options.buttons = [
          {
            title: this.i18n("button_no"), 
            color: "grey", 
            click: ({ cancel }) => cancel()
          },
          {
            title: this.i18n("button_yes"), 
            color: "primary darken-1", 
            click: ({ agree }) => { agree() }
          }
        ]
        return this.open(title, message, options)
      },
      /** Open a confirmation dialog */
      confirm(title, message, options) {
        options = Object.assign(Object.assign({}, default_options), options)
        options.buttons = [
          {
            title: this.i18n("button_yes"), 
            color: "primary darken-1", 
            click: ({ agree }) => agree()
          }
        ]
        options.cancel = true
        return this.open(title, message, options)
      },
      /** Open a dialog, no options buttons --> alert */
      open(title, message, options) {
        if (this.dialog) {
          if (this.options.important) return new Promise.resolve() // do not close current if important
          this.cancel()
        }
        this.dialog = true
        this.title = title
        this.message = message
        this.options = Object.assign(Object.assign({}, default_options), options)
        return new Promise((resolve, reject) => {
          this.resolve = resolve
          this.reject = reject
        })
      },
      /** Open a temporary dialog */
      temporary(message, duration = 1000) {
        let options = Object.assign(Object.assign({}, default_options), {center: true,buttons: []})
        setTimeout(() => this.agree(), duration)
        return this.open(undefined, message, options)
      },
      /** Finish the dialog and returns true */
      agree() {
        this.resolve(true)
        this.dialog = false
      },
      /** Finish the dialog and returns false */
      cancel() {
        this.resolve(false)
        this.dialog = false
      }
    }
  }
</script>