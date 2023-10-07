/**
 * @author            : salih.cendik
 * @last modified on  : 28-09-2023
 * @last modified by  : salih.cendik
**/
import { LightningElement, wire, api, track } from 'lwc';

//APEX
import searchShop from '@salesforce/apex/TR_StandController.searchShop';
import searchProduct from '@salesforce/apex/TR_StandController.searchProduct';
import searchSerie from '@salesforce/apex/TR_StandController.searchSerie';
import insertStand from '@salesforce/apex/TR_StandController.insertStand';
import getDivisionsByParentAccount from '@salesforce/apex/TR_StandController.fetchDivisionsByAccountId';

//LWC
import { getPicklistValues, getObjectInfos } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

//SCHEMA
import ACCOUNT_DISPLAY_OBJECT from '@salesforce/schema/Account_Display__c';
import ACCOUNT_DISPLAY_PRODUCT_OBJECT from '@salesforce/schema/Account_Display_Product__c';
import STAND_TYPE_FIELD from '@salesforce/schema/Account_Display__c.Stand_Type__c';
import STAND_STATUS_FIELD from '@salesforce/schema/Account_Display__c.Stand_Status__c';
import PANEL_STATUS_FIELD from '@salesforce/schema/Account_Display_Product__c.Status__c';

//LABELS
import requiredField from '@salesforce/label/c.Required_Field';
//import trStandForm_StandType from '@salesforce/label/c.trStandForm_StandType';
import trStandForm_StandStatus from '@salesforce/label/c.trStandForm_StandStatus';
import trStandForm_DescforOther from '@salesforce/label/c.trStandForm_DescforOther';
import trStandForm_StandCode from '@salesforce/label/c.trStandForm_StandCode';
import trStandForm_UploadImage from '@salesforce/label/c.trStandForm_UploadImage';
import trStandForm_Shop from '@salesforce/label/c.trStandForm_Shop';
import trStandForm_Width from '@salesforce/label/c.trStandForm_Width';
import trStandForm_Height from '@salesforce/label/c.trStandForm_Height';
import trStandForm_Actions from '@salesforce/label/c.trStandForm_Actions';
import trStandForm_PanelCode from '@salesforce/label/c.trStandForm_PanelCode';
import trStandForm_Header1 from '@salesforce/label/c.trStandForm_Header1';
import trStandForm_PanelSerie from '@salesforce/label/c.trStandForm_PanelSerie';
import trStandForm_PanelUploadImage from '@salesforce/label/c.trStandForm_PanelUploadImage';
import trStandForm_PanelStatus from '@salesforce/label/c.trStandForm_PanelStatus';
import trStandForm_Save from '@salesforce/label/c.trStandForm_Save';
import trStandForm_Header2 from '@salesforce/label/c.trStandForm_Header2';
import trStandForm_CheckPanelNumber from '@salesforce/label/c.trStandForm_CheckPanelNumber';
import trStandForm_RequiredPanelOrSerie from '@salesforce/label/c.trStandForm_RequiredPanelOrSerie';
import trStandForm_RequiredPanelImage from '@salesforce/label/c.trStandForm_RequiredPanelImage';
import trStandForm_CheckRequiredFields from '@salesforce/label/c.trStandForm_CheckRequiredFields';
import trStandForm_Width_HelpText from '@salesforce/label/c.trStandForm_Width_HelpText';
import trStandForm_Height_HelpText from '@salesforce/label/c.trStandForm_Height_HelpText';
import trStandForm_StandCode_HelpText from '@salesforce/label/c.trStandForm_StandCode_HelpText';

const panelNumberOfStandCode = new Map([
    ['D21', 28],
    ['D19', 14],
    ['D09', 20],
    ['D10', 10],
    ['Diğer - Panelli', 1]
]);


export default class TrStandForm extends NavigationMixin(LightningElement) {
    showSpinner = false;
    selectedShop = {};
    isBlankShop = false;
    selectedStandCode = {};
    isBlankStandCode = false;
    //selectedStandType;
    //isBlankStandType = false;
    //standTypeOptions = [];
    selectedStandStatus;
    isBlankStandStatus = false;
    standStatusOptions = [];
    panelStatusOptions = [];
    filteredPanelStatusOptions = [];
    @track panels = [];
    selectedWidth;
    isBlankWidth = false;
    selectedHeight;
    isBlankHeight = false;
    selectedDescForOther
    isBlankDescForOther = false;
    @api recordId;
    accountDisplayRecordTypeId;
    accountDisplayProductRecordTypeId;
    standImageFile = {};
    isBlankStandImageFile = false;
    accountDivisions = [];
    label = {
        requiredField,
        //trStandForm_StandType,
        trStandForm_StandStatus,
        trStandForm_DescforOther,
        trStandForm_StandCode,
        trStandForm_UploadImage,
        trStandForm_Shop,
        trStandForm_Width,
        trStandForm_Height,
        trStandForm_Actions,
        trStandForm_PanelCode,
        trStandForm_Header1,
        trStandForm_PanelSerie,
        trStandForm_PanelUploadImage,
        trStandForm_PanelStatus,
        trStandForm_Save,
        trStandForm_Header2,
        trStandForm_CheckPanelNumber,
        trStandForm_RequiredPanelOrSerie,
        trStandForm_RequiredPanelImage,
        trStandForm_CheckRequiredFields,
        trStandForm_Width_HelpText,
        trStandForm_Height_HelpText,
        trStandForm_StandCode_HelpText
    }
    async handleShopSearch(searchTerm) {
        try {
            return await searchShop({ searchTerm, parentAccountId: this.inputAdditionalCriteria });
        } catch (e) {
            console.log(e.body.message);
        }
    }
    //following this inputAdditionalCriteria:
    get shopSearchFilter() {
        return this.recordId;
    }

    handleShopSelect(event) {
        const { recordId, label } = event.detail;
        this.selectedShop.Id = recordId;
        this.selectedShop.Name = label;
        this.isBlankShop = false
        this.removeErrorForField(this.refs.shopLayout);
    }

    /*
    handleStandTypeChange(event) {
        this.selectedStandType = event.target.value;
        this.isBlankStandType = false;
    }*/

    handleStandStatusChange(event) {
        this.selectedStandStatus = event.target.value;
        this.isBlankStandStatus = false;
        if (this.selectedStandCode.Id) {
            this.removeStandCode();
        }
    }

    removeStandCode() {
        const lookupCmpForStandCode = this.refs.standCodeLookup;
        if (lookupCmpForStandCode) {
            const event = { detail: { name: 'standCode' } };
            lookupCmpForStandCode.handleRemoveSelect(event);
        }
    }

    async handleStandCodeSearch(searchTerm) {
        try {
            return await searchProduct({ searchTerm, filter: this.inputAdditionalCriteria });
        } catch (e) {
            console.log(e.body.message);
        }
    }

    //following this inputAdditionalCriteria:
    get standCodeSearchFilter() {
        const filter = {
            type: 'standCode',
            standStatus: this.selectedStandStatus,
            accountDivisions: this.accountDivisions
        };

        return JSON.parse(JSON.stringify(filter));
    }

    handleStandCodeSelect(event) {
        const { recordId, label, standCode } = event.detail;
        let selectedStandCode = { Id: recordId, Name: label, StandCode: standCode };
        this.isBlankStandCode = false
        this.removeErrorForField(this.refs.standCodeLayout);

        if (!recordId) {
            this.panels = [];
            selectedStandCode = {};
            return;
        }

        this.selectedStandCode = selectedStandCode;
        this.panels = this.generatePanels(selectedStandCode.StandCode);
        this.doFilterPanelStatusOptions();
    }

    generatePanels(standCode) {
        const panelSize = panelNumberOfStandCode.get(standCode);
        const panels = [];
        for (let index = 1; index <= panelSize; index++) {
            let panelNo = this.generatePanelNo(standCode, index);
            const panel = { index: panelNo, status: 'Active' }
            panels.push(panel);
        }
        return panels;
    }

    generatePanelNo(standCode, index) {
        let panelNo = index;
        if (standCode != 'D21') return panelNo;

        let group = Math.ceil(index / 14);
        let number = (index % 14 === 0) ? 14 : index % 14;
        panelNo = `${group}.${number}`;
        return panelNo;
    }
    handleWidthChange(event) {
        this.selectedWidth = event.detail.value;
        this.isBlankWidth = false;
    }

    handleHeightChange(event) {
        this.selectedHeight = event.detail.value;
        this.isBlankHeight = false;
    }
    connectedCallback() {
        this.getDivisionsForParentAccount();
    }

    getDivisionsForParentAccount() {
        getDivisionsByParentAccount({ parentAccountId: this.recordId })
            .then(result => {
                this.accountDivisions = result;
            })
            .catch(error => {
                console.log('getDivisionsForParentAccount() Error:', error);
            });
    }

    @wire(getObjectInfos, { objectApiNames: [ACCOUNT_DISPLAY_OBJECT, ACCOUNT_DISPLAY_PRODUCT_OBJECT] })
    objectInfoHandler({ data, error }) {
        if (data) {
            // ACCOUNT_DISPLAY_OBJECT
            const account_rtis = data.results[0].result.recordTypeInfos;
            this.accountDisplayRecordTypeId = Object.keys(account_rtis).find(rti => account_rtis[rti].name === 'TR Account Stand' || account_rtis[rti].name === 'Stant');

            // ACCOUNT_DISPLAY_PRODUCT_OBJECT
            const accountDisplayProduct_rtis = data.results[1].result.recordTypeInfos;
            this.accountDisplayProductRecordTypeId = Object.keys(accountDisplayProduct_rtis).find(rti => accountDisplayProduct_rtis[rti].name === 'TR Panel');
        } else if (error) {
            console.log('Error:', error);
        }
    }

    /*
    @wire(getPicklistValues, { recordTypeId: '$accountDisplayRecordTypeId', fieldApiName: STAND_TYPE_FIELD })
    standTypePicklist({ error, data }) {
        if (data) {
            console.log('Stand Type Data', data);
            this.standTypeOptions = [...this.generatePicklistForCombobox(data)];
        } else if (error) {
            console.log('Error:', error);
        }
    }*/

    @wire(getPicklistValues, { recordTypeId: '$accountDisplayRecordTypeId', fieldApiName: STAND_STATUS_FIELD })
    standStatusPicklist({ error, data }) {
        if (data) {
            console.log('Stand Status Data', data);
            this.standStatusOptions = [...this.generatePicklistForCombobox(data)];
        } else if (error) {
            console.log('Error:', error);
        }
    }

    async handlePanelSearch(searchTerm) {
        try {
            return await searchProduct({ searchTerm, filter: this.inputAdditionalCriteria });
        } catch (e) {
            console.log(e.body.message);
        }
    }

    //following this inputAdditionalCriteria:
    get panelCodeSearchFilter() {
        const filter = {
            type: 'panelCode',
            standCode: this.selectedStandCode.StandCode,
            standStatus: this.selectedStandStatus,
            accountDivisions: this.accountDivisions
        };
        return JSON.parse(JSON.stringify(filter));
    }

    handlePanelSelect(event) {
        const { recordId, index, label, productCode } = event.detail;
        const newPanels = this.panels.filter(() => true);
        const thisPanel = newPanels.filter(c => c.index == index)[0] || {};
        thisPanel['productId'] = recordId;
        thisPanel['productName'] = label;
        thisPanel['productCode'] = productCode;
        this.panels = newPanels;
    }

    async handleSerieSearch(searchTerm) {
        try {
            return await searchSerie({ searchTerm });
        } catch (e) {
            console.log(e.body.message);
        }
    }

    handleSerieSelect(event) {
        const { recordId, index } = event.detail;
        this.updatePanelByIndex(index, 'serieId', recordId);
    }

    @wire(getPicklistValues, { recordTypeId: '$accountDisplayProductRecordTypeId', fieldApiName: PANEL_STATUS_FIELD })
    panelStatusPicklist({ error, data }) {
        if (data) {
            console.log('Panel Status Data', data);
            this.panelStatusOptions = [...this.generatePicklistForCustomSelect(data)];
        } else if (error) {
            console.log('Error:', error);
        }
    }

    handlePanelStatusChange(event) {
        const { index, option } = event.detail;
        this.updatePanelByIndex(index, 'status', option);
    }

    handleDescForOtherChange(event) {
        this.selectedDescForOther = event.detail.value;
        this.isBlankDescForOther = false;
    }

    handleAddItem() {
        const newPanels = this.panels;
        const lastItemIndex = newPanels.length > 0 ? newPanels[newPanels.length - 1].index + 1 : 1;
        newPanels.push({
            index: lastItemIndex,
            status: 'Active'
        });
        this.panels = newPanels;
    }

    handleDeleteItem(event) {
        const index = event.target.name;
        const newPanels = this.panels.filter((item) => item.index != index).sort((a, b) => a.index > b.index ? 1 : -1);
        this.panels = newPanels;
    }

    handleStandFileChange(event) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            var reader = new FileReader()
            reader.onload = () => {
                var base64 = reader.result.split(',')[1];
                this.standImageFile = {
                    name: file.name,
                    content: base64
                }
            }
            reader.readAsDataURL(file)
        }
    }

    handlePanelFileChange(event) {
        const index = event.target.name;
        if (event.target.files.length > 0) {
            const file = event.target.files[0]
            var reader = new FileReader()
            reader.onload = () => {
                var base64 = reader.result.split(',')[1];
                const imageFile = {
                    name: file.name,
                    content: base64
                }
                this.updatePanelByIndex(index, 'file', imageFile);
            }
            reader.readAsDataURL(file)
        }
    }
    handleSave() {
        console.log('panels: ', this.panels);

        this.showSpinner = true;
        if (!this.formValidator()) {
            this.showSpinner = false;
            return false;
        }
        const accountDisplay = this.mappingAccountDisplay();
        const accountDisplayProducts = this.mappingAccountDisplayProduct();
        insertStand({ stand: JSON.stringify(accountDisplay), panels: JSON.stringify(accountDisplayProducts), accountId: this.recordId })
            .then(result => {
                this.showSpinner = false;
                this.showToast('Successfully', `Account Display Id: ${result}`, 'success');
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: result,
                        objectApiName: 'Account_Display__c',
                        actionName: 'view'
                    },
                });
            })
            .catch(error => {
                console.log('handleSave-error ', error);
                this.showToast('Error', error.body.message, 'error');
            }).finally(() => {
                this.showSpinner = false;
            });
    }

    mappingAccountDisplay() {
        const accountDisplay = {};
        accountDisplay.Shop__c = this.selectedShop.Id;
        //accountDisplay.Stand_Type__c = this.selectedStandType;
        accountDisplay.Stand_Status__c = this.selectedStandStatus;
        accountDisplay.Stand_Code__c = this.selectedStandCode.Id;

        if (this.selectedDescForOther) {
            accountDisplay.Desc_for_Other__c = this.selectedDescForOther;
        }
        if (!this.isBlankWidth) {
            accountDisplay.Width__c = this.selectedWidth;
        }
        if (!this.isBlankHeight) {
            accountDisplay.Height__c = this.selectedHeight;
        }

        let resultObj = { accountDisplay: accountDisplay };
        if (this.standImageFile) {
            resultObj.fileName = this.standImageFile.name;
            resultObj.fileContent = this.standImageFile.content;
        }
        return resultObj;
    }

    mappingAccountDisplayProduct() {
        let accountDisplayProducts = [];
        for (let i = 0; i < this.panels.length; i++) {
            let panel = this.panels[i];
            let accountDisplayProduct = {};
            accountDisplayProduct.Panel_No__c = Number(panel.index);
            accountDisplayProduct.Status__c = panel.status;

            if (panel.productId) {
                accountDisplayProduct.Product__c = panel.productId;
            }

            if (panel.serieId) {
                accountDisplayProduct.Serie__c = panel.serieId;
            }

            let resultObj = { accountDisplayProduct: accountDisplayProduct };
            if (panel.file) {
                resultObj.fileName = panel.file.name;
                resultObj.fileContent = panel.file.content;
            }

            accountDisplayProducts.push(resultObj);
        }
        return accountDisplayProducts;
    }

    doFilterPanelStatusOptions() {
        if (this.selectedStandStatus == 'New Stand') {
            this.filteredPanelStatusOptions = this.panelStatusOptions.filter(item => item.recordId != 'Blank Panel');
        } else {
            this.filteredPanelStatusOptions = this.panelStatusOptions;
        }
    }
    generatePicklistForCombobox(data) {
        return data.values.map(item => ({
            value: item.value,
            label: item.label
        }));
    }

    generatePicklistForCustomSelect(data) {
        return data.values.map(item => ({
            recordId: item.value,
            label: item.label
        }));
    }

    updatePanelByIndex(index, key, value) {
        const newPanels = this.panels.filter(() => true);
        const thisPanel = newPanels.filter(c => c.index == index)[0] || {};
        thisPanel[key] = value;
        this.panels = newPanels;
    }

    formValidator() {
        return this.standValidator() && this.panelValidator();
    }

    panelValidator() {
        const panelNumber = panelNumberOfStandCode.get(this.selectedStandCode.StandCode);
        const condition1 = this.shouldGeneratePanels && this.panels.length != panelNumber;
        const condition2 = this.isOtherWithPanel && this.panels.length == 0;
        if (condition1 || condition2) {
            this.showToast(this.label.trStandForm_CheckPanelNumber, '', 'error');
            return false;
        }

        for (let i = 0; i < this.panels.length; i++) {
            const panel = this.panels[i];
            if (panel.status == 'Active' && !panel.productId && !panel.serieId) {
                this.showToast('Panel Layout', `Panel No #${panel.index}: ${this.label.trStandForm_RequiredPanelOrSerie}`, 'error');
                return false;
            }
            if (this.isExistingStand && panel.serieId && !panel.file) {
                this.showToast('Panel Layout', `Panel No #${panel.index}: ${this.label.trStandForm_RequiredPanelImage}`, 'error');
                return false;
            }
        }
        return true;
    }
    standValidator() {
        let isValidForm = true;

        //Check Shop

        if (!this.selectedShop.Id) {
            this.refs.shopLayout.classList.add('slds-has-error');
            this.isBlankShop = true;
            isValidForm = false;
        } else {
            this.isBlankShop = false;
            this.removeErrorForField(this.refs.shopLayout);
        }

        //Stand Type
        /*
        if (!this.selectedStandType) {
            this.isBlankStandType = true;
            isValidForm = false;
        } else {
            this.isBlankStandType = false;
        }*/

        //Stand Status
        if (!this.selectedStandStatus) {
            this.isBlankStandStatus = true;
            isValidForm = false;
        } else {
            this.isBlankStandStatus = false;
        }

        //Check Stand Code
        if (!this.selectedStandCode.Id) {
            this.refs.standCodeLayout.classList.add('slds-has-error');
            this.isBlankStandCode = true;
            isValidForm = false;
        } else {
            this.isBlankStandCode = false;
            this.removeErrorForField(this.refs.standCodeLayout);
        }

        //Check Image File
        if (this.isExistingStand && !this.hasStandImgFile) {
            this.isBlankStandImageFile = true;
            isValidForm = false;
        } else {
            this.isBlankStandImageFile = false;
        }

        //Check Desc for Other
        if (this.showDescForOther && !this.selectedDescForOther) {
            this.isBlankDescForOther = true;
            isValidForm = false;
        } else {
            this.isBlankDescForOther = false;
        }

        //Check Width
        if (this.shouldGeneratePanels && !this.selectedWidth) {
            this.isBlankWidth = true;
            isValidForm = false;
        } else {
            this.isBlankWidth = false;
        }

        //Check Height
        if (this.shouldGeneratePanels && !this.selectedHeight) {
            this.isBlankHeight = true;
            isValidForm = false;
        } else {
            this.isBlankHeight = false;
        }

        if (!isValidForm) {
            this.showToast('Stand Layout', this.label.trStandForm_CheckRequiredFields, 'error');
        }

        return isValidForm;
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }
    removeErrorForField(domRef) {
        const classList = domRef.classList;
        if (classList.contains('slds-has-error')) {
            domRef.classList.remove('slds-has-error');
        }
    }
    get showPanelSection() {
        return !this.isBlankStandCode;
    }

    get isOtherWithPanel() {
        return this.selectedStandCode.StandCode == 'Diğer - Panelli';
    }

    get isOtherWithoutPanel() {
        return this.selectedStandCode.StandCode == 'Diğer - Panelsiz';
    }
    get showDescForOther() {
        return this.isOtherWithPanel || this.isOtherWithoutPanel;
    }

    get showSerieLayout() {
        return this.isExistingStand;
    }

    get isExistingStand() {
        return this.selectedStandStatus == 'Existing Stand';
    }

    get isNewStand() {
        return this.selectedStandStatus == 'New Stand';
    }
    get shouldGeneratePanels() {
        return this.selectedStandCode.StandCode == 'D19' ||
            this.selectedStandCode.StandCode == 'D21' ||
            this.selectedStandCode.StandCode == 'D09' ||
            this.selectedStandCode.StandCode == 'D10' ||
            this.selectedStandCode.StandCode == 'Diğer - Panelli';
    }

    get hasStandImgFile() {
        return Object.keys(this.standImageFile).length !== 0
    }

}