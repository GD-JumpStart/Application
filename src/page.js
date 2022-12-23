const page = async (pg) => {
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

    document.querySelector('body > main > *').style.opacity = '0'
    await wait(200)

    document.querySelector('body > main').innerHTML = ''
    document.querySelectorAll(`aside span a`).forEach(e => { e.style.background = '' })
    document.querySelector(`aside span a[data-page="${pg}"]`).style.background = '#343a40'

    var units = {
        year  : 31536e6,
        month : 2628e6,
        day   : 864e5,
        hour  : 36e5,
        minute: 6e4,
        second: 1e3
    }

    var rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

    var getRelativeTime = (d1, d2 = new Date()) => {
    var elapsed = d1 - d2

    for (var u in units) 
        if (Math.abs(elapsed) > units[u] || u == 'second') 
        return rtf.format(Math.round(elapsed/units[u]), u)
    }

    await new Promise(resolve => {
        switch (pg) {
            case 'library':

            document.querySelector('body > main').innerHTML = `<div style="display: flex; padding: 14px; flex-wrap: wrap; align-content: flex-start">
            <div id="library">
                <div>
                    <span></span>
                    <span>Mod Name</span>
                    <span>Version</span>
                    <span>Last Modified</span>
                </div>
            </div>
        </div>`

        let _mods = Object.keys(mods)
        for (let i = 0; i < _mods.length; i++) {
            let mod = _mods[i]
            let version = `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 12)}.${Math.floor(Math.random() * 30)}`
            document.getElementById('library').innerHTML += `<div data-modid="${i}">
                <span><img src="../assets/defaultmod.png" alt="${mod}'s icon" style="border-radius: 11px; ${mods[mod].enabled ? '' : 'filter: grayscale(1)'}" height="60" width="60"></span>
                <span title="${mod}">${mod}</span>
                <span title="v${version}">v${version}</span>
                <span title="${new Date(mods[mod].time).toLocaleString()} (${getRelativeTime(mods[mod].time)})">${getRelativeTime(mods[mod].time)}</span>
            </div>`
        }
        for (let i = 0; i < _mods.length; i++) {
            document.querySelector(`#library div[data-modid="${i}"]`).addEventListener('contextmenu', (e) => {
                let context = document.getElementsByTagName('context')[0]
                context.innerHTML = ''
                // let update = context.appendChild(document.createElement('button'))
                let disable = context.appendChild(document.createElement('button'))
                let del = context.appendChild(document.createElement('button'))
                // update.innerText = 'Update'
                if (mods[_mods[i]].enabled) disable.innerText = 'Disable'
                else disable.innerText = 'Enable'
                del.innerText = 'Delete'
                del.id = 'del'
                context.style.top = e.clientY + 10 + 'px'
                context.style.left = e.clientX + 10 + 'px'
                let bounding = context.getBoundingClientRect()
                if (bounding.bottom >= (window.innerHeight - 5 || document.documentElement.clientHeight - 5)) {
                    context.style.top = e.clientY - bounding.height - 5 + 'px'
                }
                if (bounding.right >= (window.innerWidth - 5 || document.documentElement.clientWidth - 5)) {
                    context.style.left = e.clientX - bounding.width - 5 + 'px'
                }
                context.style.display = 'flex'

                disable.addEventListener('click', () => {
                    context.style.display = 'none'
                    if (mods[_mods[i]].enabled == false) {
                        mods[_mods[i]].enabled = true
                        document.querySelector(`#library div[data-modid="${i}"] span img`).style.filter = ''
                    } else {
                        mods[_mods[i]].enabled = false
                        document.querySelector(`#library div[data-modid="${i}"] span img`).style.filter = 'grayscale(1)'
                    }

                    mods[_mods[i]].enabled
                    
                    let list = ''
                    _mods.forEach(m => { if (mods[m].enabled) list += m + '.dll\r\n' })
                    fs.writeFileSync(path.join(localStorage.GDDIR, '/mods.txt'), list)
                })

                del.addEventListener('click', async () => {
                    context.style.display = 'none'
                    const confirm = await modal({ title: 'Confirmation' })
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

                    confirm.querySelector('div').innerHTML = `
                        <p>Are you sure you want to delete <strong>${_mods[i]}</strong>?</p>
                        <p>This action <strong>cannot</strong> be undone!</p>
                    `

                    confirm.querySelectorAll('button')[0].addEventListener('click', async () => {
                        await fs.unlinkSync(path.join(localStorage.GDDIR, `/quickldr/${_mods[i]}.dll`))
                        let list = ''
                        await _mods.forEach(m => { if (mods[m].enabled && m != _mods[i]) list += m + '.dll\r\n' })
                        await fs.writeFileSync(path.join(localStorage.GDDIR, '/quickldr/settings.txt'), list)
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                        document.querySelector(`#library div[data-modid="${i}"]`).style.transition = '200ms ease-out'
                        document.querySelector(`#library div[data-modid="${i}"]`).style.opacity = '0'
                        await wait(200)
                        document.querySelector(`#library div[data-modid="${i}"]`).style.display = 'none'
                    })

                    confirm.querySelectorAll('button')[1].addEventListener('click', async () => {
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                    })
                })
            })
        }

        document.addEventListener('click', e => {
            if (document.getElementsByTagName('context')[0].contains(e.target)) return;
            document.getElementsByTagName('context')[0].style.display = 'none'
        })
        
        resolve()
        break
            case 'installations':
                document.querySelector('body > main').innerHTML = `
                <div style="display: flex; padding: 14px; flex-wrap: wrap; align-content: flex-start">
                    <div id="library">
                        <div>
                            <span></span>
                            <span>Pack Name</span>
                            <span>Day Added</span>
                        </div>
                    </div>
                </div>
                `
                if (fs.existsSync(path.join(localStorage.GDDIR, 'CrystalClient.geode'))) document.getElementById('library').innerHTML += `
                <div data-modid="1" id="the">
                <span><img src="../assets/icon.svg" alt="lmao's icon" style="border-radius: 11px; height="60" width="60"></span>
                <span title="Crystal">Crystal</span>
                <span title="v0.2">v0.2</span>
                </div>
                `
                document.getElementById('library').innerHTML += `
                <div data-modid="2">
                    <span><img src="../assets/icon.svg" alt="lmao's icon" style="border-radius: 11px; height="60" width="60"></span>
                    <span title="Second">Second</span>
                    <span title="v0.2">v0.2</span>
                </div>
                <div data-modid="3">
                    <span><img src="../assets/icon.svg" alt="lmao's icon" style="border-radius: 11px; height="60" width="60"></span>
                    <span title="Third">Third</span>
                    <span title="v0.2">v0.2</span>
                </div>
                `
                the.addEventListener('click', e => {
                    window.close();
                })
                break
            default:

                document.querySelector('body > main').innerHTML = '<center></center>'
                alert('Woah now! This feature isn\'t in place yet. Come back later, alright?')

                resolve()
        }
    })

    await wait(200)
    document.querySelector('body > main > *').style.opacity = '1'
}

module.exports = page