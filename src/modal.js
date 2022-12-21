const modal = (o = {}) => new Promise(async (resolve, reject) => {
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

    const options = {
        mouseLeave: true,
        close: true
    }

    Object.keys(o).forEach(k => {
        options[k] = o[k]
    })

    let closemodal = async () => {
        modal.style.opacity = '0'
        modalcontainer.style.opacity = '0'
        await wait(200)
        modalcontainer.style.display = 'none'
        document.removeEventListener('click', mouseleave)
        document.removeEventListener('click', closemodal)
    }

    let mouseleave = async e => {
        if (e.target.closest('#modal')) return;
        modal.style.opacity = '0'
        modalcontainer.style.opacity = '0'
        await wait(200)
        modalcontainer.style.display = 'none'
        document.removeEventListener('click', mouseleave)
    }

    const modalcontainer = document.getElementById('modalcontainer')
    if (modalcontainer.style.display == 'flex') return reject({ reason: 'modal_open' })
    modalcontainer.style.display = 'flex'
    await wait(100)
    modalcontainer.style.opacity = '1'
    await wait(100)
    const modal = document.getElementById('modal')
    await wait(100)
    modal.style.opacity = '1'

    const topsection = document.getElementById('topsection')
    
    if (options.title != undefined) {
        topsection.querySelector('h1').innerText = options.title
        topsection.style.border = ''
        topsection.style.marginBottom = ''
    }
    else {
        topsection.querySelector('h1').innerText = ''
        topsection.style.border = 'none'
            topsection.style.marginBottom = '0px'
    }

    const close = topsection.querySelector('button')
    if (options.close) {
        close.style.display = 'flex'
        close.addEventListener('click', async () => {
            modal.style.opacity = '0'
            modalcontainer.style.opacity = '0'
            await wait(200)
            modalcontainer.style.display = 'none'
            document.removeEventListener('click', mouseleave)
            document.removeEventListener('click', closemodal)
        })
    } else {
        close.style.display = 'none'
    }

    if (options.mouseLeave) document.addEventListener('click', mouseleave)
    resolve(modal.getElementsByTagName('main')[0])
})

module.exports = modal