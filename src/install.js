const modal = require('./modal')

const install = () => new Promise(async (resolve, reject) => {
    await new Promise(async resolve => {
        const confirm = await modal({ title: 'New Installation' })
                    confirm.innerHTML = `<div style="
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        flex-direction: column;
                    "></div><div style="
                        padding: 10px;
                        height: 43px;
                        border-top: 1px #343a40 solid;
                        margin-top: 10px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center
                    ">
                        <button id="continue" class="style red">Delete Mod</button><button id="continue" class="style">Nevermind</button>
                    </div>`
    })
})