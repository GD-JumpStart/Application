const page = async (pg) => {
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

    document.querySelector('body > main > *').style.opacity = '0'
    await wait(200)

    document.querySelector('body > main').innerHTML = ''
    document.querySelectorAll(`aside span a`).forEach(e => { e.style.background = '' })
    document.querySelector(`aside span a[data-page="${pg}"]`).style.background = '#343a40'

    await new Promise(resolve => {
        switch (pg) {
            case 'library':

                document.querySelector('body > main').innerHTML = '<div style="display: flex; padding: 14px; flex-wrap: wrap; align-content: flex-start"></div>'

                let _mods = Object.keys(mods)
                for (let i = 0; i < _mods.length; i++) {
                    let mod = mods[_mods[i]]
                    document.querySelector('body > main > *').innerHTML += `<button class="card">${_mods[i]}</button>`
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