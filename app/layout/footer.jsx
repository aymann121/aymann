import Image from 'next/image'
import icybroom from './icybroom.png'
import Link from 'next/link'
import twitterIcon from './Icons/twitterIcon.png'
import googleIcon from './Icons/gmailIcon.png'
import discordIcon from './Icons/discordIcon.png'

export default function Footer() {
    const footerLinks = [
        {
            name: 'Twitter',
            link: 'https://twitter.com/',
            image: twitterIcon
        },
        {
            name: 'Gmail',
            link: 'https://gmail.com/',
            image: googleIcon
        },
        {
            name: 'Discord',
            link: 'https://discord.com/',
            image: discordIcon
        },
    ]
    return (
        <div></div>
    )
}