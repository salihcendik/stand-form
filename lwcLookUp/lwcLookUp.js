/**
 * @last modified on  : 04-10-2023
 * @last modified by  : salih.cendik
**/
import { LightningElement, api } from 'lwc';

export default class LwcLookUp extends LightningElement {
    @api inputId;
    @api inputDataId;
    @api inputPlaceholder;
    @api inputRequired;
    @api inputSearch;
    @api inputSelectedRecordId;
    @api inputSelectedLabel;
    @api inputSelectedImage;
    @api inputSelectedIcon;
    @api inputAdditionalCriteria;

    showPill = false;
    showLoadingSpinner = false;
    showDropdown = false;
    searchTerm;
    searchResults;
    selectedSearchResult;

    connectedCallback() {
        if (!!this.inputSelectedRecordId) {
            let initialSelect = {
                recordId: this.inputSelectedRecordId,
                label: this.inputSelectedLabel,
                image: this.inputSelectedImage,
                icon: this.inputSelectedIcon
            };
            this.selectedSearchResult = initialSelect;
            this.showDropdown = false;
            this.showPill = true;
        }
    }


    handleRecordSearch(event) {
        this.showDropdown = false;
        this.searchTerm = this.template.querySelector('[data-id="' + this.inputDataId + '"]').value;
        if (this.searchTerm && event.keyCode === 13) {
            this.showLoadingSpinner = true;
            this.inputSearch(this.searchTerm)
                .then(results => {
                    this.searchResults = results;
                    this.showDropdown = true;
                    this.showLoadingSpinner = false;
                })
                .catch(this._handleError);
        }
    }
    /*
    handleRecordSearchBlur() {
        this.showDropdown = false;
    }
    */
    handleSearchResultSelection(event) {
        if (event.currentTarget.dataset.key) {
            let index = this.searchResults.findIndex(x => x.recordId === event.currentTarget.dataset.key);
            if (index !== -1) {
                this.selectedSearchResult = this.searchResults[index];
                this.showDropdown = false;
                this.showPill = true;
                const productchangeEvent = new CustomEvent("inputselect", {
                    detail: { recordId: this.selectedSearchResult.recordId, index: event.currentTarget.dataset.input, label: this.selectedSearchResult.label, productCode: this.selectedSearchResult.secondaryLabel, baseUnitOfProduct: this.selectedSearchResult.baseUnitOfProduct, standCode: this.selectedSearchResult.standCode, imageURL: this.selectedSearchResult.imageURL, conversions: this.selectedSearchResult.conversions }
                });
                this.dispatchEvent(productchangeEvent);

            }
        }
    }

    @api handleRemoveSelect(event) {
        this.showPill = false;
        this.selectedSearchResult = '';
        this.searchTerm = '';
        const productchangeEvent = new CustomEvent("inputselect", {
            detail: { recordId: '', index: event.detail.name, label: '' }
        });
        this.dispatchEvent(productchangeEvent);
    }
}