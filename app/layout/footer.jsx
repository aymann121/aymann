import Image from 'next/image'
import icybroom from './icybroom.png'
import Link from 'next/link'
import twitterIcon from './Icons/x.png'
import googleIcon from './Icons/gmailIcon.png'
import email from './Icons/email.png'
import discordIcon from './Icons/discordIcon.png'
import linkedIn from './Icons/linkedIn.webp'
import github from './Icons/github.png'
import instagram from './Icons/instagram.webp'

export default function Footer() {
    const footerLinks = [
        // {
        //     name: 'Twitter',
        //     link: 'https://x.com/Aymann_121',
        //     image: twitterIcon
        // },
        {
            name: 'LinkedIn',
            link: 'https://www.linkedin.com/in/ayman-noreldaim-473172264/',
            image: linkedIn
        },
        {
            name: 'Github',
            link: 'https://github.com/aymann121',
            image: github
        },
        {
            name: 'Instagram',
            link: 'https://www.instagram.com/aymann_121/',
            image: instagram
        },
        // {
        //     name: 'Gmail',
        //     link: 'https://gmail.com/',
        //     image: googleIcon
        // },
        {
            name: 'Email',
            link: 'mailto:aymannoreldaim@gmail.com',
            image: email
        },
        // {
        //     name: 'Discord',
        //     link: 'https://discord.com/',
        //     image: discordIcon
        // },
    ]
    return (
        <footer className = " h-40 py-6 flex items-center mt-auto">
                <div className = "flex w-full text-center  justify-center space-x-7">
                    {footerLinks.map((page, index) => {
                            return (
                                <Link target="_blank" className = "rounded hover:bg-gray-400" href = {page.link} key = {index}>
                                    <Image src={page.image} alt={page.name} width={50}  />
                                </Link>
                            )
                        })}
                </div>
        </footer>
    )
}