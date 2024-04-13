// ==UserScript==
// @name         ニコタイ用チャット
// @namespace    http://tampermonkey.net/
// @version      2024-04-07
// @description  try to take over the world!
// @author       You
// @include       *twitch.tv*chat*
// @include       https://www.youtube.com/live_chat?is_popout=1&v=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitch.tv
// @require https://greasyfork.org/scripts/455494-micromodal-min-js/code/micromodal-min%20js.js?version=1121802
// @require https://unpkg.com/dexie@latest/dist/dexie.js
// @grant        none
// ==/UserScript==

const ELEMENT_STYLE = `<style>
#typing_mode, #typing_mode_option{
    font-size:120%;
    cursor:pointer;
    padding:5px;
    border-radius:0.4rem;
    user-select: none;
}

#typing_mode:hover, #typing_mode_option:hover{
    background:rgba(83, 83, 95, 0.48);
    color:#efeff1;
}
</style>
<style id="typing_mode_styles"></style>`

const BTNS = `<div id="typing_mode_option" data-micromodal-trigger="modal-1" style="display:none;"><strong>⚙️</strong></div><div id="typing_mode"><strong>⌨</strong></div>`


class SetUp {

    constructor(){
        this.setUp()
        document.head.insertAdjacentHTML("beforeend",ELEMENT_STYLE)
    }

    setUp(){
        document.body.insertAdjacentHTML("afterend",`<div id="modal-1" aria-hidden="false" class="">
  <div class="modal__overlay" tabindex="-1" data-micromodal-close="">
    <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">

      <header class="modal__header">
        <h3 id="modal-1-title" class="modal__title">
          ニコタイ用チャット作成
        </h3>
      </header>

      <form id="modal-1-content" class="modal__content">
        <label>コメントサイズ<input id="comment_size" type="number" min="0" max="100" value="${dbData.commentSize.data}"> %</label>

          <div>
            <label>チャットサイズ<input id="chat_input_size" type="number" min="100" max="350" value="${dbData.chatInputSize.data}"> %</label>
            <label><input id="chat_input_bold" type="checkbox" ${dbData.chatInputBold.data ? "checked" : ""}>フォントを太くする</label>
            ${location.host == 'www.twitch.tv' ? `<label><input id="chat_input_height" type="checkbox" ${dbData.chatInputHeight.data ? "checked" : ""}>高さを拡張</label>`:''}
          </div>
            <label>チャット文字間隔<input id="chat_input_spacing" type="number" value="${dbData.chatInputSpacing.data}" max="1" min="0" step="0.1">px</label>
      </form>

    </div>
  </div>
</div>
<style>
  #modal-1 {
    display: none;
    user-select: none;
  }

  #modal-1.is-open {
    display: block;
    color: rgb(255 255 255 / 90%);
  }

  .modal__container {
    background-color: #212121;
    padding: 30px;
    margin-right: 20px;
    margin-left: 20px;
    max-width: 640px;
    max-height: 100vh;
    width: 100%;
    border-radius: 4px;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .modal__overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    background: rgba(0,0,0,0.6);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #modal-1-content * {
    font-size: large;
  }

  .modal__content {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
  }

  .modal__content > * {
    margin-bottom:1.3rem;
  }

  #modal-1-content input[type="number"] {
    width: 50px;
    height: 27px;
    margin-left: 10px;
  }

</style>`)

        document.getElementById("modal-1-content").addEventListener('input', this.updateOption.bind(this))
    }

    updateOption(event){
        this.updateStyle()

        if(event.target.type == "number"){
            db.notes.put({id:event.target.id, data:event.target.value});
        }else if(event.target.type == "checkbox"){
            db.notes.put({id: event.target.id, data:event.target.checked});
        }

    }

    modalOpen(){
        MicroModal.init()
    }

    start(event){
        const STYLE = document.getElementById("typing_mode_styles")
        const OPTION_BTN = document.getElementById("typing_mode_option")

        if(STYLE.textContent){
            STYLE.textContent = ``
            OPTION_BTN.style.display = 'none'
            event.target.style.color = 'rgb(239, 239, 241)'
            event.target.placeholder = 'タイピングモードを有効にする'
        }else{
            this.updateStyle()
            OPTION_BTN.style.display = 'block'
            event.target.style.color = 'gold'
            event.target.placeholder = 'タイピングモードを解除する'
        }

    }

}



class Twitch extends SetUp {

    constructor(){
        super()
        document.getElementsByClassName("chat-input__buttons-container")[0].lastElementChild.insertAdjacentHTML("afterbegin",BTNS)
        document.getElementById("typing_mode").addEventListener('click',this.start.bind(this))
        document.getElementById("typing_mode_option").addEventListener('click',this.modalOpen.bind(this))
    }

    updateStyle(){
        const COMMENT_SIZE = document.getElementById("comment_size").value
        const CHAT_BOLD = document.getElementById("chat_input_bold").checked
        const CHAT_HEIGHT = document.getElementById("chat_input_height").checked
        document.getElementById("typing_mode_styles").textContent = `
          .chat-input__textarea{
            zoom:${document.getElementById("chat_input_size").value}%;
            font-weight:${CHAT_BOLD ? 'bold':'normal'};
            letter-spacing:${document.getElementById("chat_input_spacing").value}px;
          }

          ${CHAT_HEIGHT ? `.chat-wysiwyg-input__editor {
            height:70px;
            max-height:70px!important;
          }` : '' }

          .chat-wysiwyg-input__editor,.chat-wysiwyg-input__placeholder {
            padding-left:10px!important;
          }


          .chat-input__badge-carousel,.stream-chat-header,[data-a-target="bits-button"],.DGdsv${Number(COMMENT_SIZE) <= 0 ? ',[aria-label="チャットメッセージ"]':''}{
            display:none!important;
          }

          .scrollable-area{
            zoom:${COMMENT_SIZE}%;
          }

          .chat-input__buttons-container:before {
            content: "　Shift+Enter:改行";
         }
        `
    }

}

class YouTube extends SetUp {

    constructor(){
        super()
        document.getElementById("live-chat-header-context-menu").insertAdjacentHTML("beforebegin",BTNS)
        document.getElementById("typing_mode").addEventListener('click',this.start.bind(this))
        document.getElementById("typing_mode_option").addEventListener('click',this.modalOpen.bind(this))
        document.getElementById("typing_mode_option").click()
    }

    updateStyle(){
        const COMMENT_SIZE = document.getElementById("comment_size").value
        const CHAT_BOLD = document.getElementById("chat_input_bold").checked

        document.getElementById("typing_mode_styles").textContent = `
          yt-live-chat-text-input-field-renderer{
            zoom:${document.getElementById("chat_input_size").value}%;
            font-weight:${CHAT_BOLD ? 'bold':'normal'};
            letter-spacing:${document.getElementById("chat_input_spacing").value}px;
          }

          #avatar, #message-buttons, #picker-buttons${Number(COMMENT_SIZE) <= 0 ? ', #chat':''}{
            display:none!important;
          }

          #chat{
            zoom:${COMMENT_SIZE}%;
          }
        `
    }

}




class DBData {

    constructor(){
        this.load()
    }

    async load(){
        this.commentSize = await db.notes.get('comment_size') || {id:'comment_size', data:'70'};
        this.chatInputSize = await db.notes.get('chat_input_size') || {id:'chat_input_size', data:'200'};
        this.chatInputBold = await db.notes.get('chat_input_bold') || {id:'chat_input_bold', data:true};
        this.chatInputSpacing = await db.notes.get('chat_input_spacing') || {id:'chat_input_spacing', data:'0'};
        this.chatInputHeight = await db.notes.get('chat_input_height') || {id:'chat_input_height', data:false};
        initialize()
    }
}

let db = new Dexie('TypingDatabase');
db.version(1).stores({notes: "++id"});
let dbData = new DBData()

function initialize(){

        if(location.host == 'www.twitch.tv'){

            if(document.getElementsByClassName("chat-input__buttons-container").length){
                new Twitch()
            }else{
                setTimeout(initialize,500)
            }

        }else if(location.host == 'www.youtube.com'){
                new YouTube()
        }


}
