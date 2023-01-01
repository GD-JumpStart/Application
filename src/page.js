module.exports = async (pg, ex = {}) => {
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

    const getRelativeTime = (d1, d2 = new Date()) => {
        var elapsed = d1 - d2
        for (var u in units) if (Math.abs(elapsed) > units[u] || u == 'second') 
        return rtf.format(Math.round(elapsed/units[u]), u)
    }

    await new Promise(resolve => {
        switch (pg) {
            case 'library':

                let alloff = true

                document.querySelector('body > main').innerHTML = `<div style="padding: 10px 14px; min-height: calc(100vh - 53px);">
                    <div><h1>Mod Library</h1><p>Edit, Toggle, Manage and  your Installed Mods.</p></div>
                    <div id="options"><label tabindex="0">Install External Mod<input type="file" accept=".dll" style="display: none"></label><button>Check for Updates</button><button>Disable All Mods</button><button>Sort and Filter <span>\uF282</span></button></div>
                    <div id="filtermenu"></div>
                    <div id="library">
                        <div>
                            <span></span>
                            <span>Mod Name</span>
                            <span>Version</span>
                            <span>Last Modified</span>
                        </div>
                    </div>
                </div>`

                for (let i = 0; i < Object.keys(mods).length; i++) {
                    let mod = Object.keys(mods)[i]
                    let version = `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 12)}.${Math.floor(Math.random() * 30)}`
                    document.getElementById('library').innerHTML += `<div data-modid="${i}" tabindex="0">
                        <span><img src="../assets/defaultmod.png" alt="${mod}'s icon" style="border-radius: 11px; ${mods[mod].enabled ? '' : 'filter: grayscale(1)'}; transition: filter 200ms ease-in-out" height="60" width="60"></span>
                        <span title="${mod}">${mod}</span>
                        <span title="v${version}">v${version}</span>
                        <span title="${new Date(mods[mod].time).toLocaleString()} (${getRelativeTime(mods[mod].time)})">${getRelativeTime(mods[mod].time)}</span>
                    </div>`

                    if (mods[mod].enabled) alloff = false
                }

                if (alloff) document.querySelectorAll('#options button')[1].innerText = 'Enable All Mods'

                for (let i = 0; i < Object.keys(mods).length; i++) {
                    document.querySelector(`#library div[data-modid="${i}"]`).addEventListener('contextmenu', (e) => {
                        let context = document.getElementsByTagName('context')[0]
                        context.innerHTML = ''
                        // let update = context.appendChild(document.createElement('button'))
                        let disable = context.appendChild(document.createElement('button'))
                        let del = context.appendChild(document.createElement('button'))
                        // update.innerText = 'Update'
                        if (mods[Object.keys(mods)[i]].enabled) disable.innerText = 'Disable'
                        else disable.innerText = 'Enable'
                        del.innerText = 'Delete'
                        del.id = 'del'
                        context.style.display = 'flex'
                        context.style.top = e.clientY + 10 + 'px'
                        context.style.left = e.clientX + 10 + 'px'
                        let bounding = context.getBoundingClientRect()
                        if (bounding.bottom >= (window.innerHeight - 5 || document.documentElement.clientHeight - 5)) {
                            context.style.top = e.clientY - bounding.height + 'px'
                        }
                        if (bounding.right >= (window.innerWidth - 5 || document.documentElement.clientWidth - 5)) {
                            context.style.left = e.clientX - bounding.width + 'px'
                        }

                        disable.addEventListener('click', () => {
                            context.style.display = 'none'
                            if (mods[Object.keys(mods)[i]].enabled == false) {
                                mods[Object.keys(mods)[i]].enabled = true
                                document.querySelector(`#library div[data-modid="${i}"] span img`).style.filter = ''
                            } else {
                                mods[Object.keys(mods)[i]].enabled = false
                                document.querySelector(`#library div[data-modid="${i}"] span img`).style.filter = 'grayscale(1)'
                            }

                            mods[Object.keys(mods)[i]].enabled
                            
                            let list = ''
                            Object.keys(mods).forEach(m => { if (mods[m].enabled) list += m + '.dll\r\n' })
                            fs.writeFileSync(path.join(storage.GDDIR, '/quickldr/settings.txt'), list)
                            if (list == '') document.querySelectorAll('#options button')[1].innerText = 'Enable All Mods'
                            else document.querySelectorAll('#options button')[1].innerText = 'Disable All Mods'
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
                                <p>Are you sure you want to delete <strong>${Object.keys(mods)[i]}</strong>?</p>
                                <p>This action <strong>cannot</strong> be undone!</p>
                            `

                            confirm.querySelectorAll('button')[0].addEventListener('click', async () => {
                                await fs.unlinkSync(path.join(storage.GDDIR, `/quickldr/${Object.keys(mods)[i]}.dll`))
                                let list = ''
                                await Object.keys(mods).forEach(m => { if (mods[m].enabled && m != Object.keys(mods)[i]) list += m + '.dll\r\n' })
                                await fs.writeFileSync(path.join(storage.GDDIR, '/quickldr/settings.txt'), list)
                                delete mods[Object.keys(mods)[i]]
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

                document.querySelector('#options input').addEventListener('change', async e => {
                    let mod = e.target.files[0]
                    if (!mod.name.endsWith('.dll')) return
                    if (Object.keys(mods).indexOf(mod.name.slice(0, -4)) == -1) {
                        let read = fs.createReadStream(mod.path)
                        let write = fs.createWriteStream(path.join(storage.GDDIR, '/quickldr/', mod.name))

                        read.pipe(write)

                        fs.writeFileSync(path.join(storage.GDDIR, '/quickldr/settings.txt'), mod.name, { flag: 'a' })
                        mods[mod.name.slice(0, -4)] = { enabled: true, time: mod.lastModified }
                        page('library')

                        await wait(400)
                    }

                    document.querySelector(`#library div[data-modid="${Object.keys(mods).indexOf(mod.name.slice(0, -4))}"]`).scrollIntoView()
                })

                document.querySelectorAll('#options button')[1].addEventListener('click', e => {                    
                    if (e.target.innerText.startsWith('Enable')) {
                        Object.keys(mods).forEach(m => mods[m].enabled = true)
                        document.querySelectorAll(`#library div span img`).forEach(e => e.style.filter = '')
                        e.target.innerText = 'Disable All Mods'
                    } else {
                        Object.keys(mods).forEach(m => mods[m].enabled = false)
                        document.querySelectorAll(`#library div span img`).forEach(e => e.style.filter = 'grayscale(1)')
                        e.target.innerText = 'Enable All Mods'
                    }

                    let list = ''
                    Object.keys(mods).forEach(m => { if (mods[m].enabled) list += m + '.dll\r\n' })
                    fs.writeFileSync(path.join(storage.GDDIR, '/quickldr/settings.txt'), list)
                })

                document.querySelector('main div').ondrop = async e => {
                    e.preventDefault()
                    let files = [...e.dataTransfer.files]
                    let useful = false

                    files.forEach(mod => {
                        if (Object.keys(mods).indexOf(mod.name.slice(0, -4)) != -1 || !mod.name.endsWith('.dll')) return
                        useful = true
                        let read = fs.createReadStream(mod.path)
                        let write = fs.createWriteStream(path.join(storage.GDDIR, '/quickldr/', mod.name))

                        read.pipe(write)

                        fs.writeFileSync(path.join(storage.GDDIR, '/quickldr/settings.txt'), mod.name, { flag: 'a' })
                        mods[mod.name.slice(0, -4)] = { enabled: true, time: mod.lastModified }
                    })

                    if (useful) page('library')
                }

                document.querySelector('main div').ondragover = e => {
                    e.preventDefault()
                }
                
                resolve()

                break
            case 'store':
                
                document.querySelector('body > main').innerHTML = `<div style="padding: 10px 14px; min-height: calc(100vh - 53px);">
                    <div><h1>Mod Library</h1><p>Edit, Toggle, Manage and  your Installed Mods.</p></div>
                    <div id="store"></div>
                </div>`

                https.get({
                    hostname: 'api.github.com',
                    path: '/repos/GD-JumpStart/Mods/contents',
                    headers: {
                        'User-Agent': navigator.userAgent + `User ${storage.UUID}`
                    }
                }, res => {
                    let _data = ''
                    res.on('data', (d) => _data += d)
                    res.on('end', async () => {
                        _data = JSON.parse(_data)
                        document.getElementById('store').innerHTML += '<h2>Popular</h2>'
                        let div = document.getElementById('store').appendChild(document.createElement('div'))
                        for (let i = 0; i < _data.length; i++) {
                            let data = _data[i]
                            https.get({
                                hostname: 'raw.githubusercontent.com',
                                path: `/GD-JumpStart/Mods/main/${data.name}/mod.json`,
                                headers: {
                                    'User-Agent': navigator.userAgent + `User ${storage.UUID}`
                                }
                            }, res => {
                                let moddata = ''
                                res.on('data', (d) => moddata += d)
                                res.on('end', async () => {
                                    moddata = JSON.parse(moddata)
                                    div.innerHTML += `<button href="https://github.com/GD-JumpStart/Mods/raw/main/${data.name}/${data.name}.dll" style="
                                        background-image: url('https://github.com/GD-JumpStart/Mods/raw/main/${data.name}/header.png')
                                    ">
                                        <div>
                                            <img src="https://github.com/GD-JumpStart/Mods/raw/main/${data.name}/icon.png">
                                            <span>
                                                <h4>${data.name}</h4>
                                                <p>${moddata.author} - v${moddata.version}</p>
                                            </span>
                                        </div>
                                    </button>`
                                })
                            })
                        }
                    })
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