const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
            <div className="max-w-7xl mx-auto text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    &copy; {currentYear} Mahad Tahfidz Al-Qur'an UIN Bandung. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;

