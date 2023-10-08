class CurrentUser{
    constructor(user){
        for(let key of Object.keys(user.toObject())){
            if(key == 'password' || key == 'salt') continue;
            this[key] = user[key]
        }
        this._id = user._id;
        this.permissions = this.permissions.map(permission => permission.type);
    }

    // PERMISSIONS
    can_create_category(){
        if(this.role != 1) return false;
        if(this.permissions.includes('create_category')) return true;
        return false;
    }
    can_edit_category(){
        if(this.role != 1) return false;
        if(this.permissions.includes('edit_category')) return true;
        return false;
    }
    can_delete_category(){
        if(this.role != 1) return false;
        if(this.permissions.includes('delete_category')) return true;
        return false;
    }
    can_create_product(){
        if(this.role != 1) return false;
        if(this.permissions.includes('create_product')) return true;
        return false;
    }
    can_edit_product(){
        if(this.role != 1) return false;
        if(this.permissions.includes('edit_product')) return true;
        return false;
    }
    can_delete_product(){
        if(this.role != 1) return false;
        if(this.permissions.includes('delete_product')) return true;
        return false;
    }
    can_create_order(){
        if(this.role != 1) return false;
        if(this.permissions.includes('create_order')) return true;
        return false;
    }
    can_edit_order(){
        if(this.role != 1) return false;
        if(this.permissions.includes('edit_order')) return true;
        return false;
    }
    can_delete_order(){
        if(this.role != 1) return false;
        if(this.permissions.includes('delete_order')) return true;
        return false;
    }
    can_create_client(){
        if(this.role != 1) return false;
        if(this.permissions.includes('create_client')) return true;
        return false;
    }
    can_edit_client(){
        if(this.role != 1) return false;
        if(this.permissions.includes('edit_client')) return true;
        return false;
    }
    can_delete_client(){
        if(this.role != 1) return false;
        if(this.permissions.includes('delete_client')) return true;
        return false;
    }
}

export default CurrentUser;