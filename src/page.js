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
                            <span></span>
                        </div>
                    </div>
                </div>`

                let _mods = Object.keys(mods)
                for (let i = 0; i < _mods.length; i++) {
                    let mod = _mods[i]
                    let time = getRelativeTime(Date.now() - Math.floor(Math.random() * (units.year * 4)))
                    let version = `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 12)}.${Math.floor(Math.random() * 30)}`
                    document.getElementById('library').innerHTML += `<div>
                        <span><img src="../assets/defaultmod.png" alt="${mod}'s icon" style="border-radius: 11px" height="60" width="60"></span>
                        <span title="${mod}">${mod}</span>
                        <span title="v${version}">v${version}</span>
                        <span title="${time}">${time}</span>
                        <span >\uF5D4</span>
                    </div>`
                }
                
                resolve()
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