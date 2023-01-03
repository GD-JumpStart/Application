const modal = require('./modal')
const AdmZip = require("adm-zip");

const options = () => new Promise(async (resolve, reject) => {
    await new Promise(async resolve => {
        const confirm = await modal({ title: 'Options' })
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
                        <button id="continue" class="style">Cancel</button><button id="continue" class="style">Backup</button>
                    </div>`
            confirm.querySelector('div').innerHTML = `
                    <p>Are you sure you would like to backup your save file?</p>
            `
            confirm.querySelectorAll('button')[1].addEventListener('click', async () => {
                var seconds = new Date().getTime() / 1000;
                const username = os.userInfo ().username;
                const zip = new AdmZip();
                const outputFile = path.join('/Users/', username, `/Library/Application Support/GeometryDash/JUMPSTART_BACKUP_${seconds}.zip`);
                document.querySelector('#modal').style.opacity = '0'
                document.querySelector('#modalcontainer').style.opacity = '0'
                await wait(200)
                document.querySelector('#modalcontainer').style.display = 'none'
                zip.addLocalFolder(path.join('/Users/', username, '/Library/Application Support/GeometryDash/'));
                zip.writeZip(outputFile);
            })

            confirm.querySelectorAll('button')[0].addEventListener('click', async () => {
                document.querySelector('#modal').style.opacity = '0'
                document.querySelector('#modalcontainer').style.opacity = '0'
                await wait(200)
                document.querySelector('#modalcontainer').style.display = 'none'
            })
        
    })
})

module.exports = options