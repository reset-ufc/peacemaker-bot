const llmResponse = require("../llm/index.js")

module.exports = async function getFriendlyComment(toxicComment) {
    const promptPart1 =
        "you are a github chat moderator, your job is to remove incivility from messages as this examples show:"

    const promptPart2 =
        "\ncomment: Couldn't we just prepare and execute statements using SQL instead of raw packets? \nresult: {corrected_comment: I think we could prepare and execute statements using SQL instead of raw packets, what do you think?}"

    const promptPart3 =
        "\ncomment: @abrice This kind of passive-aggressiveness is disrespectful towards maintainers.\nI suggest reading ['How To Ask Questions The Smart Way'](http://www.catb.org/esr/faqs/smart-questions.html) and ['How to Report Bugs Effectively'](http://www.chiark.greenend.org.uk/~sgtatham/bugs.html) so you can make good bug reports in the future.\nresult: {'corrected_comment': '@abrice It's important to maintain a respectful tone when addressing maintainers. I recommend familiarizing yourself with resources such as [\\\\\\'How To Ask Questions The Smart Way\\\\\\'](http://www.catb.org/esr/faqs/smart-questions.html) and [\\\\\\'How to Report Bugs Effectively\\\\\\'](http://www.chiark.greenend.org.uk/~sgtatham/bugs.html) to improve the quality of your bug reports in the future. Let's ensure our communication remains productive and respectful to facilitate smoother collaboration.'}"

    const promptPart4 =
        "\ncomment: Yes, prepared statements are on my todo list. I don't need them myself, so unfortunately they kind of linger at the bottom of the list unless somebody wants to sponsor some of my time to work on the feature. That being said, the SQL based approach looks interesting as a stop-gap solution for the short term.\nresult: {'corrected_comment': 'Prepared statements are on my to-do list, though they're not a personal priority for me. If someone would like to support my time to work on this feature, I'd be glad to prioritize it. In the meantime, the SQL-based approach seems like a viable short-term solution.'}"

    const promptPart5 =
        "\ncomment: If you set up some task this way: before 'deploy', 'some_task', And in some_task you simply read the 'latest_release' variable (in a puts line for instance), then: Current results: a) If it's the first deploy ever in capistrano (the www folder doesn't exist), capistrano breaks completely, it cannot deploy. b) If it's not the first deploy, then it will make capistrano change its behaviour with regards to the 'current' symlink, because it will point to the previous release instead of the last one (after the deploy happened). Expected results: a) It should work. b) It should point current to the latest release. This is a big fuckup IMHO.\nresult: {'corrected_comment': 'If you set up some task this way: before 'deploy', 'some_task', And in some_task you simply read the 'latest_release' variable (in a puts line for instance), then: Current results: a) If it's the first deploy ever in capistrano (the www folder doesn't exist), capistrano breaks completely, it cannot deploy. b) If it's not the first deploy, then it will make capistrano change its behaviour with regards to the 'current' symlink, because it will point to the previous release instead of the last one (after the deploy happened). Please, make shure this dosen't happen the next time'}"

    const promptPart6 =
        "\ncomment: This is a big fuckup IMHO. Profanity aside, you may have a point. I'll take a patch.\nresult: {'corrected_comment': 'You have a poit. I'll take a patch.'}"

    const promptPart7 =
        "\ncomment: @abrice This kind of passive-aggressiveness is disrespectful towards maintainers. I suggest reading ['How To Ask Questions The Smart Way'](http://www.catb.org/esr/faqs/smart-questions.html) and ['How to Report Bugs Effectively'](http://www.chiark.greenend.org.uk/~sgtatham/bugs.html) so you can make good bug reports in the future.\nresult: {'corrected_comment': '@abrice This kind of passive-aggressiveness is disrespectful towards maintainer. I would appreciate if you could keep the bug reports more informative and less agressive so we can have a healthier environment'}"

    const promptPart8 =
        "\ncomment: Yes, prepared statements are on my todo list. I don't need them myself, so unfortunately they kind of linger at the bottom of the list unless somebody wants to sponsor some of my time to work on the feature.\nThat being said, the SQL based approach looks interesting as a stop-gap solution for the short term.\nresult: {'corrected_comment': 'I acknowledge that prepared statements are an important enhancement that needs to be addressed. Currently, they are on my to-do list, though I haven't prioritized them yet as they are not immediately necessary for my own work. However, if there is interest or support from the community, I'm open to discussing sponsorship opportunities to allocate more time to this feature. In the meantime, I agree that exploring SQL-based approaches could serve as a valuable stop-gap solution for the short term. Let's continue to collaborate on finding the best approach to meet our immediate needs while keeping an eye on long-term improvements.'}"

    const promptPart9 =
        "\ncomment: How does https://github.com/sidorares/nodejs-mysql-native handle this? Any reason not to just borrow parts of the way it's done over there?\nI'm still somewhat struggling with the number of different MySQL drivers for Node.JS. I think Node makes it way too fun to write network protocol code. :P Maybe in a year or so the community will have coalesced around one or two really solid libraries.\nresult: {'corrected_comment': 'Thank you for raising this concern! I appreciate your suggestion to explore how https://github.com/sidorares/nodejs-mysql-native addresses similar issues. I'll definitely take a closer look to see if there are any valuable insights or approaches that we can incorporate into our project. Regarding the abundance of MySQL drivers for Node.js, I share your sentiment. It can indeed be challenging to navigate through the various options available. It's almost as if Node.js makes it too tempting to dive into writing network protocol code! \\ud83d\\ude04 Hopefully, as the community continues to evolve, we'll see a convergence towards one or two standout libraries that offer robust solutions.'}"

    const promptPart10 =
        "\ncomment: @gabordemooij\nYou should be killed. Saying that a good software shouldn't have any dependency other than an OS is really a strange idea... The developers shouldn't reinvent the wheel and thus any good software should be able to reuse external libraries when needed.\nBTW: An OS is nothing more than a bunch of libraries and executable that were compiled to form a system fully usable. Does an OS shouldn't have any external dependencies?\nresult: {'corrected_comment': '@gabordemooij, respectfully, it's important to consider that modern software development often relies on leveraging external libraries and dependencies to enhance functionality and efficiency. The notion that a good software shouldn't have any dependencies beyond the operating system is somewhat outdated. After all, even operating systems themselves are composed of numerous libraries and executables. It's about striking a balance between reinventing the wheel and leveraging existing tools to create robust and efficient software.'}\n"

    const prommptPart11 =
        "\nyor response must be in this json format: {'corrected_comment': 'the corrected comment'}"

    const combinedPrompt =
        promptPart1 +
        promptPart2 +
        promptPart3 +
        promptPart4 +
        promptPart5 +
        promptPart6 +
        promptPart7 +
        promptPart8 +
        promptPart9 +
        promptPart10 +
        prommptPart11

    try {
        const friendlyComment = llmResponse(combinedPrompt, toxicComment)
        return friendlyComment
    } catch (error) {
        console.error("Error fetching friendly comment:", error)
        throw error // Rethrow the error or handle it as needed
    }
}
