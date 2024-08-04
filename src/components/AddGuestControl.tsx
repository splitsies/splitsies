import React from "react";
import { Colors, TouchableOpacity } from "react-native-ui-lib/core";
import { IInviteViewModel } from "../view-models/invite-view-model/invite-view-model-interface";
import { lazyInject } from "../utils/lazy-inject";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import AddPerson from "../../assets/icons/add-person.svg";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { TutorialTip } from "./TutorialTip";

const _inviteViewModel = lazyInject<IInviteViewModel>(IInviteViewModel);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

export const AddGuestControl = SpThemedComponent(() => {
    return (
        <TutorialTip group="guests" stepKey="addGuest" placement="bottom">
        <TouchableOpacity onPress={() => _inviteViewModel.setInviteMenuOpen(true)}>
            <AddPerson height={_uiConfig.sizes.icon} width={_uiConfig.sizes.icon} fill={Colors.textColor} />
            </TouchableOpacity>
        </TutorialTip>
    );
});
