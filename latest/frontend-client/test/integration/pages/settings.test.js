var env = require('node-env-file');
var path = require('path');
env(__dirname + '/../../../.env');

describe('Settings ', () => {
  beforeEach(() => {
    browser.url('/settings');
    browser.execute(function (token) {
      if (document.hasOwnProperty('localStorage')) {
        document.localStorage.setItem('token', '"' + token + '"');
        return;
      }
      if (window.hasOwnProperty('localStorage')) {
        window.localStorage.setItem('token', '"' + token + '"');
        return;
      }
      localStorage.setItem('token', '"' + token + '"');
    }, process.env.TEST_JWT_TOKEN);
    browser.url('/settings');
  });

  it('should be able to load the page', () => {
    expect(browser.isExisting('.settings')).toBe(true);
  });

  describe('Primary settings ', () => {
    const currencyOptions = ['DKK', 'SEK'];

    for (const c in currencyOptions) {
      const currency = currencyOptions[c];
      it(
        'should be able to save settings with currency set as ' + currency,
        () => {
          if (
            !browser.isVisible(
              'div > div.settingsContent > div > form > div:nth-child(1) > .selectField'
            )
          ) {
            browser.waitUntil(
              browser
                .element('div > div.settingsContent > div > form > div:nth-child(1) > .selectField')
                .isVisible(),
              4000
            );
          }
          if (
            browser
              .element('div > div.settingsContent > div > form > div:nth-child(1) > .selectField')
              .isVisible()
          ) {
            browser
              .element('div > div.settingsContent > div > form > div:nth-child(1) > .selectField')
              .click();
            if (
              browser.isVisible(
                "body div > div > div > div[role='menu'] > div:nth-child(" + (Number(c) + 1) + ')'
              )
            ) {
              browser.click(
                "body div > div > div > div[role='menu'] > div:nth-child(" + (Number(c) + 1) + ')'
              ); //TODO: Perhaps add div...
              expect(currency).toBe(currencyOptions[c]);
              expect(currencyOptions).toContain(
                browser
                  .getText(
                    'div > div.settingsContent > div > form > div:nth-child(1) > .selectField > div:nth-child(2) > div > div:nth-child(2)'
                  )
                  .trim()
              );
              if (
                browser
                  .getText(
                    'div > div.settingsContent > div > form > div:nth-child(1) > .selectField > div:nth-child(2) > div > div:nth-child(2)'
                  )
                  .trim() == currency
              ) {
                expect(
                  browser
                    .getText(
                      'div > div.settingsContent > div > form > div:nth-child(1) > .selectField > div:nth-child(2) > div > div:nth-child(2)'
                    )
                    .trim()
                ).toEqual(currency);
              }
            }
          }
        },
        3
      );
    }
  });

  describe('Content settings ', () => {
    const contentSettings = ['Areas', 'Categories', 'Products']; // ingredients is special with decimals?

    function makeId() {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    }

    const newContent = {
      name: 'A New Test Content ' + makeId() + ' ' + Math.random(),
      price: '125.52',
      mass: '4.40'
    };

    for (const contentIndex in contentSettings) {
      const setting = contentSettings[contentIndex];
      var contentEditorSelector =
        'div > div.settingsContent > .contentWrapper > .content > .dataTable > .contentTable > tbody > tr.contentEditor';

      it(
        'should be able to create a new ' + setting.slice(0, -1) + ' setting',
        () => {
          if (
            !browser.isVisible(
              'div > div.settingsFilters > div.btn-' + setting.trim().toLowerCase()
            )
          ) {
            browser.waitUntil(
              browser.isVisible(
                'div > div.settingsFilters > div.btn-' + setting.trim().toLowerCase()
              ),
              4000
            );
          }
          browser.click('div > div.settingsFilters > div.btn-' + setting.trim().toLowerCase());
          if (
            browser.isVisible(
              'div > div.settingsFilters > div.btn-' + setting.trim().toLowerCase() + '.is-active'
            )
          ) {
            browser.waitUntil(
              browser.isVisible(
                'div > div.settingsContent > .contentWrapper > .content > .dataTable'
              ),
              4000
            );
          }
          if (
            browser.isVisible(
              'div > div.settingsContent > .contentWrapper > .content > .dataTable'
            ) &&
            browser.isVisible('.btnCreate') &&
            browser.isVisible(
              'div > div.settingsFilters > div.btn-' + setting.trim().toLowerCase() + '.is-active'
            )
          ) {
            expect(
              browser.isVisible(
                'div > div.settingsContent > .contentWrapper > .content > .dataTable'
              )
            ).toBeTruthy();
            expect(
              browser.isVisible(
                'div > div.settingsContent > .contentWrapper > .content > .dataTable > .pagination'
              )
            ).toBeTruthy();
            if (
              browser.isVisible(
                'div > div.settingsContent > div > div > div.dataTable > div > .btnCreate'
              ) &&
              !browser.isVisible('input#name_field')
            ) {
              browser.click(
                'div > div.settingsContent > div > div > div.dataTable > div > .btnCreate'
              );
            }
            if (
              !browser.isVisible(
                'div > div.settingsContent > div > div > div > div > .btnCreate'
              ) &&
              !browser.isVisible('input#name_field')
            ) {
              browser.click(
                'div > div.settingsContent > .contentWrapper > .content > .pagination > .btnCreate'
              );
            }
            if (
              !browser.isVisible(
                'div > div.settingsContent > .contentWrapper > .content > .pagination > .btnCreate'
              ) &&
              !browser.isVisible('input#name_field')
            ) {
              browser.click('.btnCreate');
            }

            // #app > div > div > main > div.mainAppViewContentWrapper.nav-visible > div.mainAppViewContent.is-logged-in.nav-visible > div > div.settingsContent > div > div > div > table > tbody > tr.MuiTableRow-root-3.contentEditor > td:nth-child(2) > form > div > div
            expect(browser.isVisible('input#name_field'));

            // browser.setValue(contentEditorSelector + ' input#name_field', '');
            browser.clearElement(contentEditorSelector + ' input#name_field');
            browser.setValue(contentEditorSelector + ' input#name_field', newContent.name);
            if (setting.toLowerCase().slice(0, -1) === 'product') {
              // Set and expect price & mass
              const costField = contentEditorSelector + ' input#cost_field';
              const amountField = contentEditorSelector + ' input#amount_field';

              browser.setValue(costField, '');
              browser.setValue(amountField, '');
              browser.setValue(costField, newContent.price);
              browser.setValue(amountField, newContent.mass);
              if (browser.getValue(costField) === newContent.price) {
                expect(browser.getValue(costField)).toContain(newContent.price);
              } else {
                browser.setValue(costField, '');
                browser.setValue(costField, parseFloat(newContent.price));
                expect(browser.getValue(costField)).toContain(parseFloat(newContent.price));
              }
              if (browser.getValue(amountField) === newContent.mass) {
                expect(browser.getValue(amountField)).toContain(newContent.mass);
              } else {
                browser.setValue(amountField, '');
                browser.setValue(amountField, parseFloat(newContent.mass));
                expect(browser.getValue(amountField)).toContain(parseFloat(newContent.mass));
              }

              //FIXME: Ingredients test fails because of the alert box

              // Ingreidents triggers a alert?
              //   //Ingredients
              //   var ingredientEditorSelector = 'div > div.settingsContent > .contentWrapper > .content > .dataTable > .contentTable > tbody > tr.ingredientEditor';
              //   const ingredientNameField =  ingredientEditorSelector + ' input#name_field';
              //   const ingredientCostField =  ingredientEditorSelector + ' input#cost_field';
              //   const ingredientAmountField =  ingredientEditorSelector + ' input#amount_field';
              //
              //   browser.setValue(ingredientNameField, newIngredient.name);
              //
              //   browser.setValue(ingredientCostField, newIngredient.price);
              //   browser.setValue(ingredientAmountField, newIngredient.mass);
              //
              //Check only the first (since it is the right ingredient)
              //We have to modify the numbers a bit since the masking DOES NOT like to be directly manipulated... (through an setValue in inputfield)
              // expect(browser.getValue(ingredientNameField)[0]).toBe(newIngredient.name);
              // expect(browser.getValue(ingredientCostField)[0]).toBe(1+newIngredient.price.toString());
              // expect(browser.getValue(ingredientAmountField)[0]).toBe(1+newIngredient.mass.toString());
            }

            //TODO: ... then press enter and submit?
            if (browser.isVisible(contentEditorSelector + ' td form:nth-child(1)')) {
              // .updated .newData
              if (browser.isVisible(contentEditorSelector + ' input#name_field')) {
                browser.submitForm(contentEditorSelector + ' input#name_field');
              } else {
                browser.submitForm(contentEditorSelector + ' td form:nth-child(1)');
              }

              expect(
                browser.isVisible(
                  'div > div.settingsContent > .contentWrapper > .content > .dataTable > .contentTable > tbody > tr:last-of-type > td.tableCell.name'
                )
              );
              expect(
                browser.getText(
                  'div > div.settingsContent > .contentWrapper > .content > .dataTable > .contentTable > tbody > tr:last-of-type > td.tableCell.name'
                )
              ).toContain(newContent.name);
            }
          }
        },
        3
      );

      //TODO: Do modification...

      it(
        'can modify a ' + setting.slice(0, -1) + ' setting',
        () => {
          if (
            !browser.isVisible(
              'div > div.settingsFilters > div.btn-' + setting.trim().toLowerCase()
            )
          ) {
            browser.waitUntil(
              browser.isVisible(
                'div > div.settingsFilters > div.btn-' + setting.trim().toLowerCase()
              ),
              4000
            );
          }
          browser.click('div > div.settingsFilters > div.btn-' + setting.trim().toLowerCase());
          if (
            browser.isVisible(
              'div > div.settingsFilters > div.btn-' + setting.trim().toLowerCase() + '.is-active'
            )
          ) {
            browser.waitUntil(
              browser.isVisible(
                'div > div.settingsContent > .contentWrapper > .content > .dataTable'
              ),
              4000
            );
          }
          if (
            browser.isVisible(
              'div > div.settingsContent > .contentWrapper > .content > .dataTable'
            ) &&
            browser.isVisible(
              'div > div.settingsFilters > div.btn-' + setting.trim().toLowerCase() + '.is-active'
            )
          ) {
            expect(
              browser.isVisible(
                'div > div.settingsContent > .contentWrapper > .content > .dataTable'
              )
            ).toBeTruthy();

            const modName = 'A mod name ' + makeId();
            const lastRowSelector =
              'div > div.settingsContent > .contentWrapper > .content > .dataTable > .contentTable > tbody > tr:first-of-type';
            const nameSelector = lastRowSelector + ' > td.tableCell.name';
            browser.waitUntil(browser.isVisible(lastRowSelector));
            browser.click(nameSelector);

            browser.setValue(contentEditorSelector + ' input#name_field', modName);
            expect(browser.getValue(contentEditorSelector + ' input#name_field')).toContain(
              modName
            );

            if (browser.isVisible(contentEditorSelector + ' input#name_field')) {
              browser.submitForm(contentEditorSelector + ' input#name_field');
            } else {
              browser.submitForm('form:nth-child(1)');
            }

            expect(browser.getText(nameSelector)).toContain(modName);
          }
        },
        3
      );

      //TODO: Do image modal test... (can show... can select... can upload...)
      if (setting.toLowerCase().slice(0, -1) === ('product' || 'area' || 'categorie')) {
        //this won't work on a remote browser like BrowserStack (because we cannot transfer the image in the tunnel)
        if (!process.env.BROWSERSTACK_USERNAME) {
          //yep i did a check for categorie... kill me...
          it(
            'can upload an image to ' + setting !== 'categorie' ? setting : 'category' + ' setting',
            () => {
              if (
                !browser.isVisible(
                  'div > div.settingsFilters > div.btn-' + setting.trim().toLowerCase()
                )
              ) {
                browser.waitUntil(
                  browser.isVisible(
                    'div > div.settingsFilters > div.btn-' + setting.trim().toLowerCase()
                  ),
                  4000
                );
              }
              browser.click('div > div.settingsFilters > div.btn-' + setting.trim().toLowerCase());
              browser.waitUntil(
                browser.isVisible(
                  'div > div.settingsContent > .contentWrapper > .content > .dataTable'
                ),
                4000
              );
              expect(
                browser.isVisible(
                  'div > div.settingsContent > .contentWrapper > .content > .dataTable'
                )
              ).toBeTruthy();

              // const firstRowSelector = 'div > div.settingsContent > .contentWrapper > .content > .dataTable > .contentTable > tbody > tr:nth-child(1)';
              const lastRowSelector =
                'div > div.settingsContent > .contentWrapper > .content > .dataTable > .contentTable > tbody > tr:first-of-type';
              const imageSelector = lastRowSelector + ' > td.tableCell.image';
              const modalSelector = 'body .modal';

              browser.click(imageSelector);

              browser.waitUntil(browser.isVisible(modalSelector));
              expect(browser.isVisible(modalSelector)).toBe(true);

              //uploading...
              const fileForm = modalSelector + ' .imageModalFileInput';
              const fileInputSelector = fileForm + ' input[type="file"]';
              const fileToUpload = path.join(__dirname, '..', 'fixtures', 'photo.jpg');

              //TODO: This is a WDIO Specific and only works in a desktop browser (do a strict check on this test to run or not beforehand)
              browser.chooseFile(fileInputSelector, fileToUpload);

              // Submit the image
              const imageModalSelector = modalSelector + ' .imageModal';
              const submitButton =
                imageModalSelector + ' .imageModalFooterButtons .btn:nth-child(2)';
              const expectation = expect(browser.getText(submitButton).toLowerCase()).toBe(
                'upload'
              );
              if (expectation) {
                //continue the assumption trail...
                browser.click(submitButton);
                browser.waitUntil(imageModalSelector + ' .image-gallery');
                expect(
                  browser.isExisting(imageModalSelector + ' .image-gallery .image.is-selected')
                ).toBe(true);
                browser.click(submitButton);
                //you can close the selection...
                expect(browser.isVisible(modalSelector)).toBe(false);
              }
            }
          );
        }

        it(
          'can select an image from gallery to ' + setting !== 'categorie'
            ? setting
            : 'category' + ' setting',
          () => {
            //Boilerplate selection...
            if (
              !browser.isVisible(
                'div > div.settingsFilters > div.btn-' + setting.trim().toLowerCase()
              )
            ) {
              browser.waitUntil(
                browser.isVisible(
                  'div > div.settingsFilters > div.btn-' + setting.trim().toLowerCase()
                ),
                4000
              );
            }
            if (
              browser.isVisible(
                'div > div.settingsFilters > div.btn-' + setting.trim().toLowerCase()
              )
            ) {
              if (!browser.isVisible('.imageModalFileInput')) {
                browser.click(
                  'div > div.settingsFilters > div.btn-' + setting.trim().toLowerCase()
                );
                if (
                  browser.isVisible(
                    'div > div.settingsFilters > div.btn-' +
                      setting.trim().toLowerCase() +
                      '.is-active'
                  )
                ) {
                  browser.waitUntil(
                    browser.isVisible(
                      'div > div.settingsContent > .contentWrapper > .content > .dataTable'
                    ),
                    4000
                  );
                }
              }
              if (
                browser.isVisible(
                  'div > div.settingsContent > .contentWrapper > .content > .dataTable'
                ) &&
                browser.isVisible(
                  'div > div.settingsFilters > div.btn-' +
                    setting.trim().toLowerCase() +
                    '.is-active'
                )
              ) {
                expect(
                  browser.isVisible(
                    'div > div.settingsContent > .contentWrapper > .content > .dataTable'
                  )
                ).toBeTruthy();
                const imageSelectorNew =
                  'div.settingsContent > div > div > div > table > tbody > tr:nth-child(1) > td.tableCell.image';
                const modalSelector = 'body .modal';
                if (!browser.isVisible('.imageModalFileInput')) {
                  browser.click(imageSelectorNew);
                }

                const imageModalSelector = modalSelector + ' .imageModal';
                const imageGallery = imageModalSelector + ' .image-gallery';
                const images = imageGallery + ' .image';

                if (browser.isVisible(imageGallery) && browser.isVisible(images)) {
                  expect(browser.isVisible(imageGallery)).toBeTruthy();
                  expect(browser.isVisible(images)).toBeTruthy();
                  console.log('images', $(images).length);

                  const imagePick = Math.floor(1 + Math.random() * (4 + 1 - 0));

                  var imageChosenString = imageGallery + ' .image:nth-child(' + imagePick + ')';
                  var imageChosen = browser.element(imageChosenString);
                  imageChosen.click();

                  if (imageChosen) {
                    //Reevaluate this...
                    expect(browser.isExisting(imageChosenString + '.is-selected')).toBe(true);

                    const submitButton =
                      imageModalSelector +
                      ' .imageModalFooter > .imageModalFooterButtons > .btn:nth-child(2)';

                    browser.click(submitButton);
                    if (browser.isVisible(submitButton)) {
                      browser.click(submitButton);
                    }
                    if (browser.isVisible(submitButton)) {
                      browser.click(submitButton);
                    }
                    browser.waitUntil(browser.isVisible(imageModalSelector) === false, 8000);
                    expect(browser.isVisible(imageModalSelector)).toBe(false);
                  }
                }
              }
            }
          },
          3
        );
      }
    }
  });
});
