
export class i18n {
    static get_string(str){
        //if (!document.lang) document.lang = ""
        let res = M.util.get_string(str, 'local_recitdashboard');
        //if (res.startsWith('[[')) document.lang += "'"+str+"',"+'\n'
        //if (res.startsWith('[[')) document.lang += "$string['"+str+"'] = '';"+'\n'
        return res;
    }
}