import React from "react";
import { Colors, TouchableOpacity } from "react-native-ui-lib/core";
import { IInviteViewModel } from "../view-models/invite-view-model/invite-view-model-interface";
import { lazyInject } from "../utils/lazy-inject";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import QrAdd from "../../assets/icons/qr-add.svg";
import { SpThemedComponent } from "../hocs/SpThemedComponent";

const _inviteViewModel = lazyInject<IInviteViewModel>(IInviteViewModel);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

export const ScanUserQrControl = SpThemedComponent(() => {
    return (
        <TouchableOpacity onPress={() => _inviteViewModel.setInviteMenuOpen(true)}>
            <QrAdd height={_uiConfig.sizes.icon} width={_uiConfig.sizes.icon} fill={Colors.textColor} />
        </TouchableOpacity>
    );
});
